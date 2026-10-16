/**
 * PinInput — WAI-ARIA 단일 문자 입력 그룹 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createPinInputMachine, connect } from "@/machines/pin-input";
import type {
  PinInputRootProps,
  PinInputLabelProps,
  PinInputControlProps,
  PinInputInputProps,
  PinInputHiddenInputProps,
  PinInputContextValue,
} from "./pin-input.types";

/* ─── React Context ─── */

const PinInputContext = createContext<PinInputContextValue | null>(null);

const usePinInputContext = (): PinInputContextValue => {
  const ctx = useContext(PinInputContext);
  if (!ctx) throw new Error("PinInput compound components must be used within <PinInput.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, PinInputRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    onComplete,
    length = 4,
    otp = false,
    mask = false,
    disabled = false,
    readOnly = false,
    required = false,
    pattern = "[0-9]",
    placeholder = "○",
    name,
    children,
    ...restProps
  } = props;

  const emptyValue = useMemo(() => Array(length).fill("") as string[], [length]);

  const [value, setValue] = useControllable<string[]>({
    value: controlledValue,
    defaultValue: defaultValue ?? emptyValue,
    onChange: onValueChange,
  });

  const id = useId();

  const machine = useMemo(
    () =>
      createPinInputMachine({
        id,
        value,
        length,
        otp,
        mask,
        disabled,
        readOnly,
        required,
        pattern,
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
      context: { length, otp, mask, disabled, readOnly, required, pattern, placeholder, name },
    });
  }, [length, otp, mask, disabled, readOnly, required, pattern, placeholder, name, send]);

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

  // 완료 콜백
  const prevComplete = useRef(false);
  useEffect(() => {
    const nowComplete = ctx.value.every((v) => v.length > 0);
    if (nowComplete && !prevComplete.current) {
      onComplete?.(ctx.value.join(""));
    }
    prevComplete.current = nowComplete;
  }, [ctx.value, onComplete]);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<PinInputContextValue>(
    () => ({
      value: ctx.value,
      isComplete: api.isComplete,
      getLabelProps: api.getLabelProps,
      getControlProps: api.getControlProps,
      getInputProps: api.getInputProps,
      getHiddenInputProps: api.getHiddenInputProps,
    }),
    [ctx.value, api],
  );

  const rootProps = api.getRootProps();

  return (
    <PinInputContext.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...restProps}>
        {children}
      </div>
    </PinInputContext.Provider>
  );
});

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, PinInputLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = usePinInputContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, PinInputControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = usePinInputContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Input ─── */

export const Input = forwardRef<HTMLInputElement, PinInputInputProps>(
  ({ index, ...props }, ref) => {
    const ctx = usePinInputContext();
    const inputProps = ctx.getInputProps({ index });

    return (
      <input
        ref={ref}
        {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
        {...props}
      />
    );
  },
);

/* ─── HiddenInput ─── */

export const HiddenInput = forwardRef<HTMLInputElement, PinInputHiddenInputProps>((props, ref) => {
  const ctx = usePinInputContext();
  const hiddenInputProps = ctx.getHiddenInputProps();

  return (
    <input
      ref={ref}
      {...(hiddenInputProps as React.InputHTMLAttributes<HTMLInputElement>)}
      {...props}
    />
  );
});
