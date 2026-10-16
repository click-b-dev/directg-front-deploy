/**
 * Clipboard — 클립보드 복사 유틸리티 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useMachine, useId } from "@/hooks";
import { createClipboardMachine, connect } from "@/machines/clipboard";
import type {
  ClipboardRootProps,
  ClipboardLabelProps,
  ClipboardControlProps,
  ClipboardInputProps,
  ClipboardTriggerProps,
  ClipboardIndicatorProps,
  ClipboardContextValue,
} from "./clipboard.types";

/* ─── React Context ─── */

const ClipboardCtx = createContext<ClipboardContextValue | null>(null);

const useClipboardContext = (): ClipboardContextValue => {
  const ctx = useContext(ClipboardCtx);
  if (!ctx) throw new Error("Clipboard compound components must be used within <Clipboard.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, ClipboardRootProps>((props, ref) => {
  const { value, timeout = 2000, onCopied, children, ...restProps } = props;

  const id = useId();

  const machine = useMemo(() => createClipboardMachine({ id, value, timeout }), [id]);

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { value, timeout } });
  }, [value, timeout, send]);

  // copied 상태 타이머
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopiedState = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      send({ type: "RESET" });
    }, ctx.timeout);
  }, [ctx.timeout, send]);

  const prevState = useRef(state);
  useEffect(() => {
    if (prevState.current !== "copied" && state === "copied") {
      onCopied?.();
      handleCopiedState();
    }
    prevState.current = state;
  }, [state, onCopied, handleCopiedState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<ClipboardContextValue>(
    () => ({
      value: ctx.value,
      copied: api.copied,
      getLabelProps: api.getLabelProps,
      getControlProps: api.getControlProps,
      getInputProps: api.getInputProps,
      getTriggerProps: api.getTriggerProps,
      getIndicatorProps: api.getIndicatorProps,
    }),
    [ctx.value, api],
  );

  const rootProps = api.getRootProps();

  return (
    <ClipboardCtx.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...restProps}>
        {children}
      </div>
    </ClipboardCtx.Provider>
  );
});

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, ClipboardLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useClipboardContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, ClipboardControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useClipboardContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Input ─── */

export const Input = forwardRef<HTMLInputElement, ClipboardInputProps>((props, ref) => {
  const ctx = useClipboardContext();
  const inputProps = ctx.getInputProps();

  return (
    <input ref={ref} {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)} {...props} />
  );
});

/* ─── Trigger ─── */

export const Trigger = forwardRef<HTMLButtonElement, ClipboardTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useClipboardContext();
    const triggerProps = ctx.getTriggerProps();

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

/* ─── Indicator ─── */

export const Indicator = forwardRef<HTMLDivElement, ClipboardIndicatorProps>(
  ({ copied, children, ...props }, ref) => {
    const ctx = useClipboardContext();
    const indicatorProps = ctx.getIndicatorProps({ copied });

    return (
      <div ref={ref} {...(indicatorProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);
