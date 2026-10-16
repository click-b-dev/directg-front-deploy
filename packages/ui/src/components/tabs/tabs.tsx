/**
 * Tabs — WAI-ARIA Tabs 패턴 Compound Component
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
import { useMachine } from "@/hooks";
import { useControllable } from "@/hooks";
import { useId } from "@/hooks";
import { createTabsMachine, connect } from "@/machines/tabs";
import type { TabItem } from "@/machines/tabs";
import type {
  TabsRootProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabsIndicatorProps,
  TabsContextValue,
} from "./tabs.types";

/* ─── React Context ─── */

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs compound components must be used within <Tabs.Root>");
  return ctx;
};

/* ─── Root ─── */

const Root = forwardRef<HTMLDivElement, TabsRootProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      orientation = "horizontal",
      activationMode = "automatic",
      children,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const itemsRef = useRef<TabItem[]>([]);

    const [value, setValue] = useControllable({
      value: controlledValue,
      defaultValue,
      onChange: onValueChange,
    });

    const machine = useMemo(
      () =>
        createTabsMachine({
          id,
          value,
          items: itemsRef.current,
          orientation,
          activationMode,
        }),
      [id, orientation, activationMode],
    );

    const [state, ctx, send] = useMachine(machine);

    // 외부 value → 머신 동기화
    useEffect(() => {
      send({ type: "SET_VALUE", value });
    }, [value, send]);

    // 머신 value → 외부 동기화
    const prevMachineValue = useRef(ctx.value);
    useEffect(() => {
      if (ctx.value !== prevMachineValue.current) {
        prevMachineValue.current = ctx.value;
        setValue(ctx.value);
      }
    }, [ctx.value, setValue]);

    const api = connect(state, ctx, send);

    const registerItem = useCallback(
      (item: TabItem) => {
        const exists = itemsRef.current.some((i) => i.value === item.value);
        if (!exists) {
          itemsRef.current = [...itemsRef.current, item];
          send({ type: "SET_ITEMS", items: itemsRef.current });
        }
      },
      [send],
    );

    const unregisterItem = useCallback(
      (val: string) => {
        itemsRef.current = itemsRef.current.filter((i) => i.value !== val);
        send({ type: "SET_ITEMS", items: itemsRef.current });
      },
      [send],
    );

    const ctxValue = useMemo<TabsContextValue>(
      () => ({
        value: ctx.value,
        orientation,
        getTriggerProps: api.getTriggerProps,
        getContentProps: api.getContentProps,
        getListProps: api.getListProps,
        getIndicatorProps: api.getIndicatorProps,
        registerItem,
        unregisterItem,
      }),
      [ctx.value, orientation, api, registerItem, unregisterItem],
    );

    const rootProps = api.getRootProps();

    return (
      <TabsContext.Provider value={ctxValue}>
        <div ref={ref} {...rootProps} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

/* ─── List ─── */

const List = forwardRef<HTMLDivElement, TabsListProps>(({ children, ...props }, ref) => {
  const ctx = useTabsContext();
  const listProps = ctx.getListProps();

  return (
    <div ref={ref} {...listProps} {...props}>
      {children}
    </div>
  );
});

/* ─── Trigger ─── */

const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, disabled = false, children, ...props }, ref) => {
    const ctx = useTabsContext();

    useEffect(() => {
      ctx.registerItem({ value, disabled });
      return () => ctx.unregisterItem(value);
    }, [value, disabled]);

    const triggerProps = ctx.getTriggerProps({ value, disabled });

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

const Content = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, ...props }, ref) => {
    const ctx = useTabsContext();
    const contentProps = ctx.getContentProps({ value });

    return (
      <div ref={ref} {...(contentProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Indicator ─── */

const Indicator = forwardRef<HTMLDivElement, TabsIndicatorProps>(({ children, ...props }, ref) => {
  const ctx = useTabsContext();
  const indicatorProps = ctx.getIndicatorProps();

  return (
    <div ref={ref} {...indicatorProps} {...props}>
      {children}
    </div>
  );
});

export const Tabs = { Root, List, Trigger, Content, Indicator };
