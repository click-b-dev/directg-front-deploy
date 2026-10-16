/**
 * Steps — WAI-ARIA Sequential Step Indicator Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@/hooks";
import { useControllable } from "@/hooks";
import { useId } from "@/hooks";
import { createStepsMachine, connect } from "@/machines/steps";
import type {
  StepsRootProps,
  StepsListProps,
  StepsItemProps,
  StepsTriggerProps,
  StepsContentProps,
  StepsIndicatorProps,
  StepsSeparatorProps,
  StepsNextTriggerProps,
  StepsPrevTriggerProps,
  StepsProgressProps,
  StepsContextValue,
} from "./steps.types";

/* ─── React Context ─── */

const StepsContext = createContext<StepsContextValue | null>(null);

const useStepsContext = (): StepsContextValue => {
  const ctx = useContext(StepsContext);
  if (!ctx) throw new Error("Steps compound components must be used within <Steps.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, StepsRootProps>(
  (
    {
      step: controlledStep,
      defaultStep = 0,
      onStepChange,
      count,
      linear = false,
      orientation = "horizontal",
      children,
      ...props
    },
    ref,
  ) => {
    const id = useId();

    const [step, setStep] = useControllable({
      value: controlledStep,
      defaultValue: defaultStep,
      onChange: onStepChange,
    });

    const machine = useMemo(
      () =>
        createStepsMachine({
          id,
          step,
          count,
          linear,
          orientation,
        }),
      [id, linear, orientation],
    );

    const [state, ctx, send] = useMachine(machine);

    // 외부 step -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_STEP", step });
    }, [step, send]);

    // 외부 count -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_COUNT", count });
    }, [count, send]);

    // 머신 step -> 외부 동기화
    const prevMachineStep = useRef(ctx.step);
    useEffect(() => {
      if (ctx.step !== prevMachineStep.current) {
        prevMachineStep.current = ctx.step;
        setStep(ctx.step);
      }
    }, [ctx.step, setStep]);

    const api = connect(state, ctx, send);

    const ctxValue = useMemo<StepsContextValue>(
      () => ({
        step: ctx.step,
        count: ctx.count,
        percent: api.percent,
        isFirstStep: api.isFirstStep,
        isLastStep: api.isLastStep,
        getRootProps: api.getRootProps,
        getListProps: api.getListProps,
        getItemProps: api.getItemProps,
        getTriggerProps: api.getTriggerProps,
        getContentProps: api.getContentProps,
        getIndicatorProps: api.getIndicatorProps,
        getSeparatorProps: api.getSeparatorProps,
        getNextTriggerProps: api.getNextTriggerProps,
        getPrevTriggerProps: api.getPrevTriggerProps,
        getProgressProps: api.getProgressProps,
      }),
      [ctx.step, ctx.count, api],
    );

    const rootProps = api.getRootProps();

    return (
      <StepsContext.Provider value={ctxValue}>
        <div ref={ref} {...(rootProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
          {children}
        </div>
      </StepsContext.Provider>
    );
  },
);

/* ─── List ─── */

export const List = forwardRef<HTMLDivElement, StepsListProps>(({ children, ...props }, ref) => {
  const ctx = useStepsContext();
  const listProps = ctx.getListProps();

  return (
    <div ref={ref} {...(listProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
      {children}
    </div>
  );
});

/* ─── Item ─── */

export const Item = forwardRef<HTMLDivElement, StepsItemProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useStepsContext();
    const itemProps = ctx.getItemProps({ index });

    return (
      <div ref={ref} {...(itemProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Trigger ─── */

export const Trigger = forwardRef<HTMLButtonElement, StepsTriggerProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useStepsContext();
    const triggerProps = ctx.getTriggerProps({ index });

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

/* ─── Content ─── */

export const Content = forwardRef<HTMLDivElement, StepsContentProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useStepsContext();
    const contentProps = ctx.getContentProps({ index });

    return (
      <div ref={ref} {...(contentProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Indicator ─── */

export const Indicator = forwardRef<HTMLDivElement, StepsIndicatorProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useStepsContext();
    const indicatorProps = ctx.getIndicatorProps({ index });

    return (
      <div ref={ref} {...(indicatorProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Separator ─── */

export const Separator = forwardRef<HTMLDivElement, StepsSeparatorProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useStepsContext();
    const separatorProps = ctx.getSeparatorProps({ index });

    return (
      <div ref={ref} {...(separatorProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── NextTrigger ─── */

export const NextTrigger = forwardRef<HTMLButtonElement, StepsNextTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useStepsContext();
    const nextProps = ctx.getNextTriggerProps();

    return (
      <button
        ref={ref}
        {...(nextProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── PrevTrigger ─── */

export const PrevTrigger = forwardRef<HTMLButtonElement, StepsPrevTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useStepsContext();
    const prevProps = ctx.getPrevTriggerProps();

    return (
      <button
        ref={ref}
        {...(prevProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── Progress ─── */

export const Progress = forwardRef<HTMLDivElement, StepsProgressProps>(
  ({ children, ...props }, ref) => {
    const ctx = useStepsContext();
    const progressProps = ctx.getProgressProps();

    return (
      <div ref={ref} {...(progressProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);
