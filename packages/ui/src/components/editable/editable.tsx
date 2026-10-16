/**
 * Editable — 인라인 편집 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createEditableMachine, connect } from "@/machines/editable";
import type {
  EditableRootProps,
  EditableAreaProps,
  EditableLabelProps,
  EditablePreviewProps,
  EditableInputProps,
  EditableEditTriggerProps,
  EditableSubmitTriggerProps,
  EditableCancelTriggerProps,
  EditableControlProps,
  EditableContextValue,
} from "./editable.types";

/* ─── React Context ─── */

const EditableCtx = createContext<EditableContextValue | null>(null);

const useEditableContext = (): EditableContextValue => {
  const ctx = useContext(EditableCtx);
  if (!ctx) throw new Error("Editable compound components must be used within <Editable.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, EditableRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    onSubmit,
    onCancel,
    onEdit,
    disabled = false,
    readOnly = false,
    placeholder = "Click to edit",
    submitOnBlur = true,
    submitOnEnter = true,
    maxLength = 0,
    children,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<string>({
    value: controlledValue,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });

  const id = useId();

  const machine = useMemo(
    () =>
      createEditableMachine({
        id,
        value,
        disabled,
        readOnly,
        placeholder,
        submitOnBlur,
        submitOnEnter,
        maxLength,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { disabled, readOnly, placeholder, submitOnBlur, submitOnEnter, maxLength },
    });
  }, [disabled, readOnly, placeholder, submitOnBlur, submitOnEnter, maxLength, send]);

  // 외부 value -> 머신 동기화
  useEffect(() => {
    if (controlledValue !== undefined) {
      send({ type: "SET_VALUE", value: controlledValue });
    }
  }, [controlledValue, send]);

  // 머신 value -> 외부 동기화
  const prevMachineValue = useRef(ctx.value);
  useEffect(() => {
    if (ctx.value !== prevMachineValue.current) {
      prevMachineValue.current = ctx.value;
      setValue(ctx.value);
    }
  }, [ctx.value, setValue]);

  // 상태 전이 감지를 위한 콜백
  const prevState = useRef(state);
  useEffect(() => {
    if (prevState.current !== state) {
      const wasEditing = prevState.current === "editing";
      const isNowPreview = state === "preview";

      if (wasEditing && isNowPreview) {
        // editing -> preview: submit 또는 cancel
        if (ctx.value !== ctx.previousValue) {
          // value가 변했으면 cancel이 아닌 submit
          onSubmit?.(ctx.value);
        } else {
          onCancel?.(ctx.previousValue);
        }
      }

      if (!wasEditing && state === "editing") {
        onEdit?.();
      }

      prevState.current = state;
    }
  }, [state, ctx.value, ctx.previousValue, onSubmit, onCancel, onEdit]);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<EditableContextValue>(
    () => ({
      value: ctx.value,
      isEditing: api.isEditing,
      getAreaProps: api.getAreaProps,
      getLabelProps: api.getLabelProps,
      getPreviewProps: api.getPreviewProps,
      getInputProps: api.getInputProps,
      getEditTriggerProps: api.getEditTriggerProps,
      getSubmitTriggerProps: api.getSubmitTriggerProps,
      getCancelTriggerProps: api.getCancelTriggerProps,
      getControlProps: api.getControlProps,
    }),
    [ctx.value, api],
  );

  const rootProps = api.getRootProps();

  return (
    <EditableCtx.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...restProps}>
        {children}
      </div>
    </EditableCtx.Provider>
  );
});

/* ─── Area ─── */

export const Area = forwardRef<HTMLDivElement, EditableAreaProps>(({ children, ...props }, ref) => {
  const ctx = useEditableContext();
  const areaProps = ctx.getAreaProps();

  return (
    <div ref={ref} {...(areaProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
      {children}
    </div>
  );
});

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, EditableLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useEditableContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Preview ─── */

export const Preview = forwardRef<HTMLSpanElement, EditablePreviewProps>(
  ({ children, ...props }, ref) => {
    const ctx = useEditableContext();
    const previewProps = ctx.getPreviewProps();
    const { children: previewChildren, ...restPreviewProps } = previewProps as Record<
      string,
      unknown
    > & { children?: React.ReactNode };

    return (
      <span ref={ref} {...(restPreviewProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children ?? previewChildren}
      </span>
    );
  },
);

/* ─── Input ─── */

export const Input = forwardRef<HTMLInputElement, EditableInputProps>((props, ref) => {
  const ctx = useEditableContext();
  const inputProps = ctx.getInputProps();

  return (
    <input ref={ref} {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)} {...props} />
  );
});

/* ─── EditTrigger ─── */

export const EditTrigger = forwardRef<HTMLButtonElement, EditableEditTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useEditableContext();
    const triggerProps = ctx.getEditTriggerProps();

    return (
      <button
        ref={ref}
        {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── SubmitTrigger ─── */

export const SubmitTrigger = forwardRef<HTMLButtonElement, EditableSubmitTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useEditableContext();
    const triggerProps = ctx.getSubmitTriggerProps();

    return (
      <button
        ref={ref}
        {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── CancelTrigger ─── */

export const CancelTrigger = forwardRef<HTMLButtonElement, EditableCancelTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useEditableContext();
    const triggerProps = ctx.getCancelTriggerProps();

    return (
      <button
        ref={ref}
        {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, EditableControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useEditableContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);
