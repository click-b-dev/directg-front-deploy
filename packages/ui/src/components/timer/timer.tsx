/**
 * Timer — Countdown/Countup 타이머 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useId } from "@/hooks";
import { createTimerMachine, connect } from "@/machines/timer";
import type {
  TimerRootProps,
  TimerAreaProps,
  TimerControlProps,
  TimerSeparatorProps,
  TimerItemProps,
  TimerActionTriggerProps,
  TimerContextValue,
} from "./timer.types";

/* ─── React Context ─── */

const TimerContext = createContext<TimerContextValue | null>(null);

const useTimerContext = (): TimerContextValue => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("Timer compound components must be used within <Timer.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, TimerRootProps>((props, ref) => {
  const {
    startMs = 0,
    countdown = false,
    autoStart = false,
    interval = 1000,
    onComplete,
    children,
    ...restProps
  } = props;

  const id = useId();

  const machine = useMemo(
    () =>
      createTimerMachine({
        id,
        startMs,
        countdown,
        autoStart,
        interval,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props 동기화
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { startMs, countdown, interval } });
  }, [startMs, countdown, interval, send]);

  // 타이머 tick (interval 기반)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        send({ type: "TICK" });
      }, ctx.interval);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, ctx.interval, send]);

  // onComplete 콜백 (countdown이 0에 도달하면)
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const prevState = useRef(state);
  useEffect(() => {
    if (countdown && prevState.current === "running" && state === "idle" && ctx.currentMs === 0) {
      onCompleteRef.current?.();
    }
    prevState.current = state;
  }, [state, ctx.currentMs, countdown]);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<TimerContextValue>(
    () => ({
      segments: api.segments,
      state,
      getAreaProps: api.getAreaProps,
      getControlProps: api.getControlProps,
      getSeparatorProps: api.getSeparatorProps,
      getItemProps: api.getItemProps,
      getActionTriggerProps: api.getActionTriggerProps,
    }),
    [api, state],
  );

  const rootProps = api.getRootProps();

  return (
    <TimerContext.Provider value={ctxValue}>
      <div ref={ref} {...(rootProps as React.HTMLAttributes<HTMLDivElement>)} {...restProps}>
        {children}
      </div>
    </TimerContext.Provider>
  );
});

/* ─── Area ─── */

export const Area = forwardRef<HTMLDivElement, TimerAreaProps>(({ children, ...props }, ref) => {
  const ctx = useTimerContext();
  const areaProps = ctx.getAreaProps();

  return (
    <div ref={ref} {...(areaProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
      {children}
    </div>
  );
});

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, TimerControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTimerContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Separator ─── */

export const Separator = forwardRef<HTMLSpanElement, TimerSeparatorProps>(
  ({ children, ...props }, ref) => {
    const ctx = useTimerContext();
    const separatorProps = ctx.getSeparatorProps();

    return (
      <span ref={ref} {...(separatorProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children ?? ":"}
      </span>
    );
  },
);

/* ─── Item ─── */

export const Item = forwardRef<HTMLSpanElement, TimerItemProps>(
  ({ type, children, ...props }, ref) => {
    const ctx = useTimerContext();
    const itemProps = ctx.getItemProps({ type });
    const value = ctx.segments[type];

    return (
      <span ref={ref} {...(itemProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {typeof children === "function"
          ? children(value)
          : (children ?? String(value).padStart(2, "0"))}
      </span>
    );
  },
);

/* ─── ActionTrigger ─── */

export const ActionTrigger = forwardRef<HTMLButtonElement, TimerActionTriggerProps>(
  ({ action, children, ...props }, ref) => {
    const ctx = useTimerContext();
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
