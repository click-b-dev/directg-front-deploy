import { createContext, forwardRef, useContext, useEffect, useMemo } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { mergeProps } from "@/machines/shared";
import { createProgressMachine, connectProgress } from "@/machines/progress";
import type { ProgressApi } from "@/machines/progress";
import type {
  ProgressRootProps,
  ProgressLabelProps,
  ProgressTrackProps,
  ProgressRangeProps,
  ProgressValueTextProps,
  ProgressViewProps,
  ProgressCircleProps,
  ProgressCircleTrackProps,
  ProgressCircleRangeProps,
} from "./progress.types";

const ProgressContext = createContext<ProgressApi | null>(null);

const useProgressContext = (): ProgressApi => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("Progress compound components must be used within Progress.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, ProgressRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    min = 0,
    max = 100,
    children,
    id: customId,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<number | null>({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });

  const machine = useMemo(() => createProgressMachine({ value, min, max }), [value, min, max]);

  const [state, context, send] = useMachine(machine);

  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { min, max } });
  }, [min, max, send]);

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== context.value) {
      send({ type: "SET_VALUE", value: controlledValue });
    }
  }, [controlledValue, context.value, send]);

  useEffect(() => {
    if (context.value !== value) {
      setValue(context.value);
    }
  }, [context.value, value, setValue]);

  const baseId = useId(customId);
  const ids = useMemo(() => ({ root: baseId, label: `${baseId}-label` }), [baseId]);

  const api = connectProgress(state, context, send, ids);
  const rootProps = api.getRootProps();

  return (
    <ProgressContext.Provider value={api}>
      <div ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </ProgressContext.Provider>
  );
});

const Label = forwardRef<HTMLLabelElement, ProgressLabelProps>((props, ref) => {
  const api = useProgressContext();
  const labelProps = api.getLabelProps();
  return <label ref={ref} {...mergeProps(labelProps as Record<string, unknown>, props)} />;
});

const Track = forwardRef<HTMLDivElement, ProgressTrackProps>((props, ref) => {
  const api = useProgressContext();
  const trackProps = api.getTrackProps();
  return <div ref={ref} {...mergeProps(trackProps as Record<string, unknown>, props)} />;
});

const Range = forwardRef<HTMLDivElement, ProgressRangeProps>((props, ref) => {
  const api = useProgressContext();
  const rangeProps = api.getRangeProps();
  return <div ref={ref} {...mergeProps(rangeProps as Record<string, unknown>, props)} />;
});

const ValueText = forwardRef<HTMLSpanElement, ProgressValueTextProps>((props, ref) => {
  const api = useProgressContext();
  const valueTextProps = api.getValueTextProps();
  const { children, ...rest } = props;
  return (
    <span ref={ref} {...mergeProps(valueTextProps as Record<string, unknown>, rest)}>
      {children ?? (api.percent !== null ? `${Math.round(api.percent)}%` : undefined)}
    </span>
  );
});

const View = forwardRef<HTMLDivElement, ProgressViewProps>((props, ref) => {
  const { view = "linear", ...rest } = props;
  const api = useProgressContext();
  const viewProps = api.getViewProps(view);
  return <div ref={ref} {...mergeProps(viewProps as Record<string, unknown>, rest)} />;
});

const Circle = forwardRef<SVGSVGElement, ProgressCircleProps>((props, ref) => {
  const api = useProgressContext();
  const circleProps = api.getCircleProps();
  const { children, ...rest } = props;
  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      {...mergeProps(circleProps as Record<string, unknown>, rest)}
    >
      {children}
    </svg>
  );
});

const CircleTrack = forwardRef<SVGCircleElement, ProgressCircleTrackProps>((props, ref) => {
  const api = useProgressContext();
  const trackProps = api.getCircleTrackProps();
  return (
    <circle
      ref={ref}
      cx="50"
      cy="50"
      r="45"
      fill="none"
      {...mergeProps(trackProps as Record<string, unknown>, props)}
    />
  );
});

const CircleRange = forwardRef<SVGCircleElement, ProgressCircleRangeProps>((props, ref) => {
  const api = useProgressContext();
  const rangeProps = api.getCircleRangeProps();
  return (
    <circle
      ref={ref}
      cx="50"
      cy="50"
      r="45"
      fill="none"
      {...mergeProps(rangeProps as Record<string, unknown>, props)}
    />
  );
});

export const Progress = {
  Root,
  Label,
  Track,
  Range,
  ValueText,
  View,
  Circle,
  CircleTrack,
  CircleRange,
};
