/**
 * Slider — WAI-ARIA Slider 패턴 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createSliderMachine, connect } from "@/machines/slider";
import type {
  SliderRootProps,
  SliderLabelProps,
  SliderControlProps,
  SliderTrackProps,
  SliderRangeProps,
  SliderThumbProps,
  SliderValueTextProps,
  SliderMarkerGroupProps,
  SliderMarkerProps,
  SliderContextValue,
} from "./slider.types";

/* ─── React Context ─── */

const SliderContext = createContext<SliderContextValue | null>(null);

const useSliderContext = (): SliderContextValue => {
  const ctx = useContext(SliderContext);
  if (!ctx) throw new Error("Slider compound components must be used within <Slider.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, SliderRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = [0],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    orientation = "horizontal",
    disabled = false,
    readOnly = false,
    children,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<number[]>({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });

  const id = useId();

  const machine = useMemo(
    () =>
      createSliderMachine({
        id,
        value,
        min,
        max,
        step,
        orientation,
        disabled,
        readOnly,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { min, max, step, orientation, disabled, readOnly } });
  }, [min, max, step, orientation, disabled, readOnly, send]);

  // 외부 value -> 머신 동기화
  useEffect(() => {
    send({ type: "SET_VALUE", value });
  }, [value, send]);

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

  const ctxValue = useMemo<SliderContextValue>(
    () => ({
      value: ctx.value,
      getValuePercent: api.getValuePercent,
      getLabelProps: api.getLabelProps,
      getControlProps: api.getControlProps,
      getTrackProps: api.getTrackProps,
      getRangeProps: api.getRangeProps,
      getThumbProps: api.getThumbProps,
      getValueTextProps: api.getValueTextProps,
      getMarkerGroupProps: api.getMarkerGroupProps,
      getMarkerProps: api.getMarkerProps,
    }),
    [ctx.value, api],
  );

  const rootProps = api.getRootProps();

  return (
    <SliderContext.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...restProps}>
        {children}
      </div>
    </SliderContext.Provider>
  );
});

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, SliderLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSliderContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, SliderControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSliderContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Track ─── */

export const Track = forwardRef<HTMLDivElement, SliderTrackProps>(({ children, ...props }, ref) => {
  const ctx = useSliderContext();
  const trackProps = ctx.getTrackProps();

  return (
    <div ref={ref} {...(trackProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
      {children}
    </div>
  );
});

/* ─── Range ─── */

export const Range = forwardRef<HTMLDivElement, SliderRangeProps>((props, ref) => {
  const ctx = useSliderContext();
  const rangeProps = ctx.getRangeProps();

  return <div ref={ref} {...(rangeProps as React.HTMLAttributes<HTMLDivElement>)} {...props} />;
});

/* ─── Thumb ─── */

export const Thumb = forwardRef<HTMLDivElement, SliderThumbProps>(
  ({ index = 0, children, ...props }, ref) => {
    const ctx = useSliderContext();
    const thumbProps = ctx.getThumbProps({ index });

    return (
      <div ref={ref} {...(thumbProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ValueText ─── */

export const ValueText = forwardRef<HTMLSpanElement, SliderValueTextProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSliderContext();
    const valueTextProps = ctx.getValueTextProps();

    return (
      <span ref={ref} {...(valueTextProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children ?? ctx.value.join(", ")}
      </span>
    );
  },
);

/* ─── MarkerGroup ─── */

export const MarkerGroup = forwardRef<HTMLDivElement, SliderMarkerGroupProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSliderContext();
    const markerGroupProps = ctx.getMarkerGroupProps();

    return (
      <div ref={ref} {...(markerGroupProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Marker ─── */

export const Marker = forwardRef<HTMLSpanElement, SliderMarkerProps>(
  ({ value, children, ...props }, ref) => {
    const ctx = useSliderContext();
    const markerProps = ctx.getMarkerProps({ value });

    return (
      <span ref={ref} {...(markerProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);
