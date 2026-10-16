/**
 * TagsInput — 태그 목록 관리 입력 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createTagsInputMachine, connect } from "@/machines/tags-input";
import type {
  TagsInputRootProps,
  TagsInputLabelProps,
  TagsInputControlProps,
  TagsInputInputProps,
  TagsInputItemProps,
  TagsInputItemTextProps,
  TagsInputItemDeleteTriggerProps,
  TagsInputItemPreviewProps,
  TagsInputItemInputProps,
  TagsInputClearTriggerProps,
  TagsInputHiddenInputProps,
  TagsInputContextValue,
} from "./tags-input.types";

/* ─── React Context ─── */

const TagsInputCtx = createContext<TagsInputContextValue | null>(null);

const useTagsInputContext = (): TagsInputContextValue => {
  const ctx = useContext(TagsInputCtx);
  if (!ctx) throw new Error("TagsInput compound components must be used within <TagsInput.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, TagsInputRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled = false,
    readOnly = false,
    max = 0,
    delimiter = ",",
    allowDuplicates = false,
    placeholder = "",
    name,
    children,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<string[]>({
    value: controlledValue,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });

  const id = useId();

  const machine = useMemo(
    () =>
      createTagsInputMachine({
        id,
        value,
        disabled,
        readOnly,
        max,
        delimiter,
        allowDuplicates,
        placeholder,
        name,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { disabled, readOnly, max, delimiter, allowDuplicates, placeholder, name },
    });
  }, [disabled, readOnly, max, delimiter, allowDuplicates, placeholder, name, send]);

  // 외부 value -> 머신 동기화
  useEffect(() => {
    if (controlledValue !== undefined) {
      send({ type: "SET_VALUE", value: controlledValue });
    }
  }, [controlledValue, send]);

  // 머신 value -> 외부 동기화
  const prevMachineValue = useRef(ctx.value);
  useEffect(() => {
    const changed =
      ctx.value.length !== prevMachineValue.current.length ||
      ctx.value.some((v, i) => v !== prevMachineValue.current[i]);
    if (changed) {
      prevMachineValue.current = ctx.value;
      setValue(ctx.value);
    }
  }, [ctx.value, setValue]);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<TagsInputContextValue>(
    () => ({
      value: ctx.value,
      inputValue: ctx.inputValue,
      isAtMax: api.isAtMax,
      isEditing: api.isEditing,
      editedTagIndex: api.editedTagIndex,
      getControlProps: api.getControlProps,
      getLabelProps: api.getLabelProps,
      getInputProps: api.getInputProps,
      getItemProps: api.getItemProps,
      getItemTextProps: api.getItemTextProps,
      getItemDeleteTriggerProps: api.getItemDeleteTriggerProps,
      getItemPreviewProps: api.getItemPreviewProps,
      getItemInputProps: api.getItemInputProps,
      getClearTriggerProps: api.getClearTriggerProps,
      getHiddenInputProps: api.getHiddenInputProps,
    }),
    [ctx.value, ctx.inputValue, api],
  );

  const rootProps = api.getRootProps();

  return (
    <TagsInputCtx.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...restProps}>
        {children}
      </div>
    </TagsInputCtx.Provider>
  );
});

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, TagsInputLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, TagsInputControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Input ─── */

export const Input = forwardRef<HTMLInputElement, TagsInputInputProps>((props, ref) => {
  const ctx = useTagsInputContext();
  const inputProps = ctx.getInputProps();

  return (
    <input ref={ref} {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)} {...props} />
  );
});

/* ─── Item ─── */

export const Item = forwardRef<HTMLDivElement, TagsInputItemProps>(
  ({ index, value, children, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const itemProps = ctx.getItemProps({ index, value });

    return (
      <div ref={ref} {...(itemProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ItemText ─── */

export const ItemText = forwardRef<HTMLSpanElement, TagsInputItemTextProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const textProps = ctx.getItemTextProps({ index });

    return (
      <span ref={ref} {...(textProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── ItemDeleteTrigger ─── */

export const ItemDeleteTrigger = forwardRef<HTMLButtonElement, TagsInputItemDeleteTriggerProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const deleteProps = ctx.getItemDeleteTriggerProps({ index });

    return (
      <button
        ref={ref}
        {...(deleteProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── ItemPreview ─── */

export const ItemPreview = forwardRef<HTMLDivElement, TagsInputItemPreviewProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const previewProps = ctx.getItemPreviewProps({ index });

    return (
      <div ref={ref} {...(previewProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ItemInput ─── */

export const ItemInput = forwardRef<HTMLInputElement, TagsInputItemInputProps>(
  ({ index, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const itemInputProps = ctx.getItemInputProps({ index });

    return (
      <input
        ref={ref}
        {...(itemInputProps as React.InputHTMLAttributes<HTMLInputElement>)}
        {...props}
      />
    );
  },
);

/* ─── ClearTrigger ─── */

export const ClearTrigger = forwardRef<HTMLButtonElement, TagsInputClearTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTagsInputContext();
    const clearProps = ctx.getClearTriggerProps();

    return (
      <button
        ref={ref}
        {...(clearProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── HiddenInput ─── */

export const HiddenInput = forwardRef<HTMLInputElement, TagsInputHiddenInputProps>((props, ref) => {
  const ctx = useTagsInputContext();
  const hiddenInputProps = ctx.getHiddenInputProps();

  return (
    <input
      ref={ref}
      {...(hiddenInputProps as React.InputHTMLAttributes<HTMLInputElement>)}
      {...props}
    />
  );
});
