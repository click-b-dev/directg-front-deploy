/**
 * Tour — Step-by-step guided tour Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createTourMachine, connect } from "@/machines/tour";
import type {
  TourRootProps,
  TourBackdropProps,
  TourPositionerProps,
  TourContentProps,
  TourTitleProps,
  TourDescriptionProps,
  TourProgressTextProps,
  TourCloseTriggerProps,
  TourActionTriggerProps,
  TourArrowProps,
  TourSpotlightProps,
  TourContextValue,
} from "./tour.types";

/* ─── React Context ─── */

const TourContext = createContext<TourContextValue | null>(null);

const useTourContext = (): TourContextValue => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("Tour compound components must be used within <Tour.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = (props: TourRootProps) => {
  const { steps, open: controlledOpen, defaultOpen = false, onOpenChange, children } = props;

  const [open, setOpen] = useControllable<boolean>({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const id = useId();

  const machine = useMemo(
    () =>
      createTourMachine({
        id,
        steps,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 steps 동기화
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { steps } });
  }, [steps, send]);

  // 외부 open -> 머신 동기화
  useEffect(() => {
    if (open && state === "closed") {
      send({ type: "OPEN" });
    } else if (!open && state === "open") {
      send({ type: "CLOSE" });
    }
  }, [open, state, send]);

  // 머신 state -> 외부 open 동기화
  const prevState = useRef(state);
  useEffect(() => {
    if (prevState.current !== state) {
      prevState.current = state;
      setOpen(state === "open");
    }
  }, [state, setOpen]);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<TourContextValue>(
    () => ({
      isOpen: api.isOpen,
      currentStep: api.currentStep,
      totalSteps: api.totalSteps,
      step: api.step,
      isFirstStep: api.isFirstStep,
      isLastStep: api.isLastStep,
      progressText: api.progressText,
      getBackdropProps: api.getBackdropProps,
      getPositionerProps: api.getPositionerProps,
      getContentProps: api.getContentProps,
      getTitleProps: api.getTitleProps,
      getDescriptionProps: api.getDescriptionProps,
      getProgressTextProps: api.getProgressTextProps,
      getCloseTriggerProps: api.getCloseTriggerProps,
      getActionTriggerProps: api.getActionTriggerProps,
      getArrowProps: api.getArrowProps,
      getSpotlightProps: api.getSpotlightProps,
    }),
    [api],
  );

  return <TourContext.Provider value={ctxValue}>{children}</TourContext.Provider>;
};

/* ─── Backdrop ─── */

export const Backdrop = forwardRef<HTMLDivElement, TourBackdropProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const backdropProps = ctx.getBackdropProps();

    return (
      <div ref={ref} {...(backdropProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Positioner ─── */

export const Positioner = forwardRef<HTMLDivElement, TourPositionerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const positionerProps = ctx.getPositionerProps();

    return (
      <div ref={ref} {...(positionerProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Content ─── */

export const Content = forwardRef<HTMLDivElement, TourContentProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const contentProps = ctx.getContentProps();

    return (
      <div ref={ref} {...(contentProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Title ─── */

export const Title = forwardRef<HTMLHeadingElement, TourTitleProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const titleProps = ctx.getTitleProps();

    return (
      <h2 ref={ref} {...(titleProps as React.HTMLAttributes<HTMLHeadingElement>)} {...props}>
        {children ?? ctx.step?.title}
      </h2>
    );
  },
);

/* ─── Description ─── */

export const Description = forwardRef<HTMLParagraphElement, TourDescriptionProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const descriptionProps = ctx.getDescriptionProps();

    return (
      <p ref={ref} {...(descriptionProps as React.HTMLAttributes<HTMLParagraphElement>)} {...props}>
        {children ?? ctx.step?.description}
      </p>
    );
  },
);

/* ─── ProgressText ─── */

export const ProgressText = forwardRef<HTMLSpanElement, TourProgressTextProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const progressProps = ctx.getProgressTextProps();

    return (
      <span ref={ref} {...(progressProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children ?? ctx.progressText}
      </span>
    );
  },
);

/* ─── CloseTrigger ─── */

export const CloseTrigger = forwardRef<HTMLButtonElement, TourCloseTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const triggerProps = ctx.getCloseTriggerProps();

    return (
      <button
        ref={ref}
        type="button"
        {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── ActionTrigger ─── */

export const ActionTrigger = forwardRef<HTMLButtonElement, TourActionTriggerProps>(
  ({ action, children, ...props }, ref) => {
    const ctx = useTourContext();
    const triggerProps = ctx.getActionTriggerProps({ action });

    return (
      <button
        ref={ref}
        type="button"
        {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── Arrow ─── */

export const Arrow = forwardRef<HTMLDivElement, TourArrowProps>(({ children, ...props }, ref) => {
  const ctx = useTourContext();
  const arrowProps = ctx.getArrowProps();

  return (
    <div ref={ref} {...(arrowProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
      {children}
    </div>
  );
});

/* ─── Spotlight ─── */

export const Spotlight = forwardRef<HTMLDivElement, TourSpotlightProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTourContext();
    const spotlightProps = ctx.getSpotlightProps();

    return (
      <div ref={ref} {...(spotlightProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);
