/**
 * NumberInput — WAI-ARIA SpinButton 패턴 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createNumberInputMachine, connect } from "@/machines/number-input";
import type {
  NumberInputRootProps,
  NumberInputLabelProps,
  NumberInputInputProps,
  NumberInputIncrementTriggerProps,
  NumberInputDecrementTriggerProps,
  NumberInputScrubberProps,
  NumberInputValueTextProps,
  NumberInputContextValue,
} from "./number-input.types";

/* ─── React Context ─── */

const NumberInputContext = createContext<NumberInputContextValue | null>(null);

const useNumberInputContext = (): NumberInputContextValue => {
  const ctx = useContext(NumberInputContext);
  if (!ctx)
    throw new Error("NumberInput compound components must be used within <NumberInput.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, NumberInputRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = 0,
    onValueChange,
    min = -Infinity,
    max = Infinity,
    step = 1,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    children,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<number>({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });

  const id = useId();

  const machine = useMemo(
    () =>
      createNumberInputMachine({
        id,
        value,
        min,
        max,
        step,
        disabled,
        readOnly,
        required,
        name,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { min, max, step, disabled, readOnly, required, name },
    });
  }, [min, max, step, disabled, readOnly, required, name, send]);

  // controlled value 동기화
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== ctx.value) {
      send({ type: "SET_VALUE", value: controlledValue });
    }
  }, [controlledValue, ctx.value, send]);

  // 머신 value -> 외부 동기화
  const prevMachineValue = useRef(ctx.value);
  useEffect(() => {
    if (ctx.value !== prevMachineValue.current) {
      prevMachineValue.current = ctx.value;
      setValue(ctx.value);
    }
  }, [ctx.value, setValue]);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<NumberInputContextValue>(
    () => ({
      value: ctx.value,
      inputValue: ctx.inputValue,
      getLabelProps: api.getLabelProps,
      getInputProps: api.getInputProps,
      getIncrementTriggerProps: api.getIncrementTriggerProps,
      getDecrementTriggerProps: api.getDecrementTriggerProps,
      getScrubberProps: api.getScrubberProps,
      getValueTextProps: api.getValueTextProps,
    }),
    [ctx.value, ctx.inputValue, api],
  );

  const rootProps = api.getRootProps();

  return (
    <NumberInputContext.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...restProps}>
        {children}
      </div>
    </NumberInputContext.Provider>
  );
});

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, NumberInputLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useNumberInputContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Input ─── */

export const Input = forwardRef<HTMLInputElement, NumberInputInputProps>((props, ref) => {
  const ctx = useNumberInputContext();
  const inputProps = ctx.getInputProps();

  return (
    <input ref={ref} {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)} {...props} />
  );
});

/* ─── IncrementTrigger ─── */

export const IncrementTrigger = forwardRef<HTMLButtonElement, NumberInputIncrementTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useNumberInputContext();
    const triggerProps = ctx.getIncrementTriggerProps();

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

/* ─── DecrementTrigger ─── */

export const DecrementTrigger = forwardRef<HTMLButtonElement, NumberInputDecrementTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useNumberInputContext();
    const triggerProps = ctx.getDecrementTriggerProps();

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

/* ─── Scrubber ─── */

export const Scrubber = forwardRef<HTMLDivElement, NumberInputScrubberProps>((props, ref) => {
  const ctx = useNumberInputContext();
  const scrubberProps = ctx.getScrubberProps();

  return <div ref={ref} {...(scrubberProps as React.HTMLAttributes<HTMLDivElement>)} {...props} />;
});

/* ─── ValueText ─── */

export const ValueText = forwardRef<HTMLSpanElement, NumberInputValueTextProps>(
  ({ children, ...props }, ref) => {
    const ctx = useNumberInputContext();
    const valueTextProps = ctx.getValueTextProps();

    return (
      <span ref={ref} {...(valueTextProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children ?? ctx.inputValue}
      </span>
    );
  },
);
