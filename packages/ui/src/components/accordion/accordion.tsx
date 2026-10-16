/**
 * Accordion — WAI-ARIA Accordion 패턴 Compound Component
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
import { createAccordionMachine, connect } from "@/machines/accordion";
import type { AccordionItem } from "@/machines/accordion";
import type {
  AccordionRootProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  AccordionIndicatorProps,
  AccordionContextValue,
  AccordionItemContextValue,
} from "./accordion.types";

/* ─── React Context ─── */

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordionContext = (): AccordionContextValue => {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion compound components must be used within <Accordion.Root>");
  return ctx;
};

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionItemContext = (): AccordionItemContextValue => {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error("Accordion.Trigger/Content must be used within <Accordion.Item>");
  return ctx;
};

/* ─── Root ─── */

const Root = forwardRef<HTMLDivElement, AccordionRootProps>((props, ref) => {
  const { type = "single", orientation = "vertical", children, ...restProps } = props;

  const isMultiple = type === "multiple";

  // 타입별로 value 처리
  const controlledValue = isMultiple
    ? (props as { value?: string[] }).value
    : (props as { value?: string }).value;
  const defaultValue = isMultiple
    ? (props as { defaultValue?: string[] }).defaultValue
    : (props as { defaultValue?: string }).defaultValue;
  const onValueChange = isMultiple
    ? (props as { onValueChange?: (v: string[]) => void }).onValueChange
    : (props as { onValueChange?: (v: string) => void }).onValueChange;
  const collapsible = isMultiple
    ? true
    : ((props as { collapsible?: boolean }).collapsible ?? false);

  // 내부적으로 string[]로 통일
  const normalizeToArray = (v: string | string[] | undefined): string[] => {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : v ? [v] : [];
  };

  const [value, setValue] = useControllable<string[]>({
    value: controlledValue !== undefined ? normalizeToArray(controlledValue) : undefined,
    defaultValue: normalizeToArray(defaultValue),
    onChange(nextValue) {
      if (isMultiple) {
        (onValueChange as ((v: string[]) => void) | undefined)?.(nextValue);
      } else {
        (onValueChange as ((v: string) => void) | undefined)?.(nextValue[0] ?? "");
      }
    },
  });

  const id = useId();
  const itemsRef = useRef<AccordionItem[]>([]);

  const machine = useMemo(
    () =>
      createAccordionMachine({
        id,
        value,
        items: itemsRef.current,
        multiple: isMultiple,
        collapsible,
        orientation,
      }),
    [id, isMultiple, collapsible, orientation],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 value → 머신 동기화
  useEffect(() => {
    send({ type: "SET_VALUE", value });
  }, [value, send]);

  // 머신 value → 외부 동기화
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

  const registerItem = useCallback(
    (item: AccordionItem) => {
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

  const ctxValue = useMemo<AccordionContextValue>(
    () => ({
      value: ctx.value,
      getItemProps: api.getItemProps,
      getItemTriggerProps: api.getItemTriggerProps,
      getItemContentProps: api.getItemContentProps,
      getItemIndicatorProps: api.getItemIndicatorProps,
      registerItem,
      unregisterItem,
    }),
    [ctx.value, api, registerItem, unregisterItem],
  );

  const rootProps = api.getRootProps();

  // restProps에서 accordion 전용 props 제거
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    value: _v,
    defaultValue: _dv,
    onValueChange: _ovc,
    collapsible: _c,
    type: _t,
    ...htmlProps
  } = restProps as Record<string, unknown>;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <AccordionContext.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

/* ─── Item ─── */

const Item = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, children, ...props }, ref) => {
    const ctx = useAccordionContext();

    useEffect(() => {
      ctx.registerItem({ value, disabled });
      return () => ctx.unregisterItem(value);
    }, [value, disabled]);

    const itemProps = ctx.getItemProps({ value, disabled });
    const itemCtx = useMemo<AccordionItemContextValue>(
      () => ({ value, disabled }),
      [value, disabled],
    );

    return (
      <AccordionItemContext.Provider value={itemCtx}>
        <div ref={ref} {...(itemProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);

/* ─── Trigger ─── */

const ItemTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useAccordionContext();
    const itemCtx = useAccordionItemContext();
    const triggerProps = ctx.getItemTriggerProps({
      value: itemCtx.value,
      disabled: itemCtx.disabled,
    });

    return (
      <h3 data-scope="accordion" data-part="item-heading">
        <button
          ref={ref}
          {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          {...props}
        >
          {children}
        </button>
      </h3>
    );
  },
);

/* ─── Content ─── */

const ItemContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, ...props }, ref) => {
    const ctx = useAccordionContext();
    const itemCtx = useAccordionItemContext();
    const contentProps = ctx.getItemContentProps({ value: itemCtx.value });

    return (
      <div ref={ref} {...(contentProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Indicator ─── */

const ItemIndicator = forwardRef<HTMLSpanElement, AccordionIndicatorProps>(
  ({ children, ...props }, ref) => {
    const ctx = useAccordionContext();
    const itemCtx = useAccordionItemContext();
    const indicatorProps = ctx.getItemIndicatorProps({ value: itemCtx.value });

    return (
      <span ref={ref} {...(indicatorProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

export const Accordion = { Root, Item, ItemTrigger, ItemContent, ItemIndicator };
