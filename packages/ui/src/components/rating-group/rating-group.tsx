/**
 * RatingGroup — WAI-ARIA Radio Group 변형 별점 평가 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createRatingGroupMachine, connect } from "@/machines/rating-group";
import type {
  RatingGroupRootProps,
  RatingGroupLabelProps,
  RatingGroupControlProps,
  RatingGroupItemProps,
  RatingGroupHiddenInputProps,
  RatingGroupContextValue,
} from "./rating-group.types";

/* ─── React Context ─── */

const RatingGroupContext = createContext<RatingGroupContextValue | null>(null);

const useRatingGroupContext = (): RatingGroupContextValue => {
  const ctx = useContext(RatingGroupContext);
  if (!ctx)
    throw new Error("RatingGroup compound components must be used within <RatingGroup.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, RatingGroupRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = 0,
    onValueChange,
    count = 5,
    disabled = false,
    readOnly = false,
    allowHalf = false,
    name,
    required = false,
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
      createRatingGroupMachine({
        id,
        value,
        count,
        disabled,
        readOnly,
        allowHalf,
        name,
        required,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { count, disabled, readOnly, allowHalf, name, required },
    });
  }, [count, disabled, readOnly, allowHalf, name, required, send]);

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

  const ctxValue = useMemo<RatingGroupContextValue>(
    () => ({
      value: ctx.value,
      hoveredValue: ctx.hoveredValue,
      isHovering: api.isHovering,
      count: ctx.count,
      getLabelProps: api.getLabelProps,
      getControlProps: api.getControlProps,
      getItemProps: api.getItemProps,
      getHiddenInputProps: api.getHiddenInputProps,
    }),
    [ctx.value, ctx.hoveredValue, ctx.count, api],
  );

  const rootProps = api.getRootProps();

  return (
    <RatingGroupContext.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...restProps}>
        {children}
      </div>
    </RatingGroupContext.Provider>
  );
});

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, RatingGroupLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useRatingGroupContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, RatingGroupControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useRatingGroupContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Item ─── */

export const Item = forwardRef<HTMLSpanElement, RatingGroupItemProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useRatingGroupContext();
    const itemProps = ctx.getItemProps({ index });

    return (
      <span ref={ref} {...(itemProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── HiddenInput ─── */

export const HiddenInput = forwardRef<HTMLInputElement, RatingGroupHiddenInputProps>(
  (props, ref) => {
    const ctx = useRatingGroupContext();
    const hiddenInputProps = ctx.getHiddenInputProps();

    return (
      <input
        ref={ref}
        {...(hiddenInputProps as React.InputHTMLAttributes<HTMLInputElement>)}
        {...props}
      />
    );
  },
);
