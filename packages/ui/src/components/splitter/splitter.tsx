/**
 * Splitter — WAI-ARIA Window Splitter 패턴 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { createSplitterMachine, connect } from "@/machines/splitter";
import type {
  SplitterRootProps,
  SplitterPanelProps,
  SplitterResizeTriggerProps,
  SplitterContextValue,
} from "./splitter.types";

/* ─── React Context ─── */

const SplitterContext = createContext<SplitterContextValue | null>(null);

const useSplitterContext = (): SplitterContextValue => {
  const ctx = useContext(SplitterContext);
  if (!ctx) throw new Error("Splitter compound components must be used within <Splitter.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, SplitterRootProps>((props, ref) => {
  const {
    sizes: controlledSizes,
    defaultSizes = [50, 50],
    onSizesChange,
    orientation = "horizontal",
    disabled = false,
    panels,
    step = 1,
    children,
    ...restProps
  } = props;

  const [sizes, setSizes] = useControllable<number[]>({
    value: controlledSizes,
    defaultValue: defaultSizes,
    onChange: onSizesChange,
  });

  const id = useId();

  const machine = useMemo(
    () =>
      createSplitterMachine({
        id,
        sizes,
        orientation,
        disabled,
        panels,
        step,
      }),
    [id],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 props -> 머신 동기화
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { orientation, disabled, panels, step } });
  }, [orientation, disabled, panels, step, send]);

  // 외부 sizes -> 머신 동기화
  useEffect(() => {
    send({ type: "SET_SIZES", sizes });
  }, [sizes, send]);

  // 머신 sizes -> 외부 동기화
  const prevMachineSizes = useRef(ctx.sizes);
  useEffect(() => {
    const changed =
      ctx.sizes.length !== prevMachineSizes.current.length ||
      ctx.sizes.some((v, i) => v !== prevMachineSizes.current[i]);
    if (changed) {
      prevMachineSizes.current = ctx.sizes;
      setSizes(ctx.sizes);
    }
  }, [ctx.sizes, setSizes]);

  const api = connect(state, ctx, send);

  const ctxValue = useMemo<SplitterContextValue>(
    () => ({
      sizes: ctx.sizes,
      getPanelProps: api.getPanelProps,
      getResizeTriggerProps: api.getResizeTriggerProps,
    }),
    [ctx.sizes, api],
  );

  const rootProps = api.getRootProps();

  return (
    <SplitterContext.Provider value={ctxValue}>
      <div ref={ref} {...(rootProps as React.HTMLAttributes<HTMLDivElement>)} {...restProps}>
        {children}
      </div>
    </SplitterContext.Provider>
  );
});

/* ─── Panel ─── */

export const Panel = forwardRef<HTMLDivElement, SplitterPanelProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useSplitterContext();
    const panelProps = ctx.getPanelProps({ index });

    return (
      <div ref={ref} {...(panelProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ResizeTrigger ─── */

export const ResizeTrigger = forwardRef<HTMLDivElement, SplitterResizeTriggerProps>(
  ({ index, children, ...props }, ref) => {
    const ctx = useSplitterContext();
    const triggerProps = ctx.getResizeTriggerProps({ index });

    return (
      <div ref={ref} {...(triggerProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);
