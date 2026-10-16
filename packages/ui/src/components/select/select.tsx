/**
 * Select — WAI-ARIA Listbox 패턴 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 *
 * items는 Root에 prop으로 전달하거나, Item 컴포넌트 등록으로 자동 수집한다.
 * 인덱스 추적은 등록 순서 기반 (items 배열 내 위치).
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
import { createSelectMachine, connect } from "@/machines/select";
import type { SelectItem as SelectItemType } from "@/machines/select";
import type {
  SelectRootProps,
  SelectLabelProps,
  SelectTriggerProps,
  SelectValueTextProps,
  SelectPositionerProps,
  SelectContentProps,
  SelectItemProps,
  SelectItemTextProps,
  SelectItemIndicatorProps,
  SelectHiddenSelectProps,
  SelectContextValue,
  SelectItemContextValue,
} from "./select.types";

/* ─── React Context ─── */

const SelectContext = createContext<SelectContextValue | null>(null);

const useSelectContext = (): SelectContextValue => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select compound components must be used within <Select.Root>");
  return ctx;
};

const SelectItemContext = createContext<SelectItemContextValue | null>(null);

const useSelectItemContext = (): SelectItemContextValue => {
  const ctx = useContext(SelectItemContext);
  if (!ctx) throw new Error("Select.ItemText/ItemIndicator must be used within <Select.Item>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, SelectRootProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      onOpenChange,
      items: propItems,
      name,
      children,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const itemsRef = useRef<SelectItemType[]>(propItems ?? []);

    // propItems가 변경되면 반영
    if (propItems) {
      itemsRef.current = propItems;
    }

    const [value, setValue] = useControllable({
      value: controlledValue,
      defaultValue,
      onChange: onValueChange,
    });

    const machine = useMemo(
      () =>
        createSelectMachine({
          id,
          value,
          items: itemsRef.current,
        }),
      [id],
    );

    const [state, ctx, send] = useMachine(machine);

    // 외부 value -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_VALUE", value });
    }, [value, send]);

    // 외부 items 변경 -> 머신 동기화
    useEffect(() => {
      if (propItems) {
        send({ type: "SET_ITEMS", items: propItems });
      }
    }, [propItems, send]);

    // 머신 value -> 외부 동기화
    const prevMachineValue = useRef(ctx.value);
    useEffect(() => {
      if (ctx.value !== prevMachineValue.current) {
        prevMachineValue.current = ctx.value;
        setValue(ctx.value);
      }
    }, [ctx.value, setValue]);

    // open 상태 변경 알림
    const prevState = useRef(state);
    useEffect(() => {
      if (state !== prevState.current) {
        prevState.current = state;
        onOpenChange?.(state === "open");
      }
    }, [state, onOpenChange]);

    const api = connect(state, ctx, send);

    // 외부 영역 클릭 시 닫기
    const rootRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (state !== "open") return;

      const handleClickOutside = (e: MouseEvent) => {
        const root = rootRef.current;
        if (root && !root.contains(e.target as Node)) {
          send({ type: "CLOSE" });
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [state, send]);

    const registerItem = useCallback(
      (item: SelectItemType) => {
        const exists = itemsRef.current.some((i) => i.value === item.value);
        if (!exists) {
          itemsRef.current = [...itemsRef.current, item];
          send({ type: "SET_ITEMS", items: itemsRef.current });
        } else {
          // 기존 아이템 업데이트 (label이나 disabled 변경 시)
          const updated = itemsRef.current.map((i) => (i.value === item.value ? item : i));
          const changed = updated.some(
            (u, idx) =>
              u.label !== itemsRef.current[idx]?.label ||
              u.disabled !== itemsRef.current[idx]?.disabled,
          );
          if (changed) {
            itemsRef.current = updated;
            send({ type: "SET_ITEMS", items: itemsRef.current });
          }
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

    // 아이템 인덱스 조회 함수
    const getItemIndex = useCallback(
      (val: string): number => {
        return ctx.items.findIndex((i) => i.value === val);
      },
      [ctx.items],
    );

    const ctxValue = useMemo<SelectContextValue>(
      () => ({
        value: ctx.value,
        valueLabel: ctx.valueLabel,
        open: state === "open",
        highlightedIndex: ctx.highlightedIndex,
        getRootProps: api.getRootProps,
        getLabelProps: api.getLabelProps,
        getTriggerProps: api.getTriggerProps,
        getPositionerProps: api.getPositionerProps,
        getContentProps: api.getContentProps,
        getItemProps: api.getItemProps,
        getItemTextProps: api.getItemTextProps,
        getItemIndicatorProps: api.getItemIndicatorProps,
        getValueTextProps: api.getValueTextProps,
        getHiddenSelectProps: api.getHiddenSelectProps,
        registerItem,
        unregisterItem,
        name,
        _getItemIndex: getItemIndex,
      }),
      [
        ctx.value,
        ctx.valueLabel,
        ctx.highlightedIndex,
        ctx.items,
        state,
        api,
        registerItem,
        unregisterItem,
        name,
        getItemIndex,
      ],
    );

    const rootProps = api.getRootProps();

    return (
      <SelectContext.Provider value={ctxValue}>
        <div
          ref={(node) => {
            (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          {...rootProps}
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    );
  },
);

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, SelectLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSelectContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Trigger ─── */

export const Trigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSelectContext();
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

/* ─── ValueText ─── */

export const ValueText = forwardRef<HTMLSpanElement, SelectValueTextProps>(
  ({ placeholder, children, ...props }, ref) => {
    const ctx = useSelectContext();
    const valueTextProps = ctx.getValueTextProps();
    const displayText = ctx.valueLabel || placeholder || "";

    return (
      <span ref={ref} {...(valueTextProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children ?? displayText}
      </span>
    );
  },
);

/* ─── Positioner ─── */

export const Positioner = forwardRef<HTMLDivElement, SelectPositionerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSelectContext();
    const positionerProps = ctx.getPositionerProps();

    return (
      <div ref={ref} {...(positionerProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Content ─── */

export const Content = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSelectContext();
    const contentProps = ctx.getContentProps();

    return (
      <div ref={ref} {...(contentProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Item ─── */

export const Item = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, label, disabled = false, children, ...props }, ref) => {
    const ctx = useSelectContext();
    const resolvedLabel = label ?? (typeof children === "string" ? children : value);

    useEffect(() => {
      ctx.registerItem({ value, label: resolvedLabel, disabled });
      return () => ctx.unregisterItem(value);
    }, [value, resolvedLabel, disabled]);

    // items 배열에서 인덱스 조회
    const index =
      (ctx as SelectContextValue & { _getItemIndex?: (v: string) => number })._getItemIndex?.(
        value,
      ) ?? -1;

    const itemProps = ctx.getItemProps({ value, index, disabled });
    const itemCtx = useMemo<SelectItemContextValue>(
      () => ({ value, index, disabled }),
      [value, index, disabled],
    );

    return (
      <SelectItemContext.Provider value={itemCtx}>
        <div ref={ref} {...(itemProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
          {children}
        </div>
      </SelectItemContext.Provider>
    );
  },
);

/* ─── ItemText ─── */

export const ItemText = forwardRef<HTMLSpanElement, SelectItemTextProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSelectContext();
    const itemTextProps = ctx.getItemTextProps();

    return (
      <span ref={ref} {...(itemTextProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── ItemIndicator ─── */

export const ItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSelectContext();
    const itemCtx = useSelectItemContext();
    const indicatorProps = ctx.getItemIndicatorProps({ value: itemCtx.value });

    return (
      <span ref={ref} {...(indicatorProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── HiddenSelect ─── */

export const HiddenSelect = forwardRef<HTMLSelectElement, SelectHiddenSelectProps>(
  ({ children, ...props }, ref) => {
    const ctx = useSelectContext();
    const hiddenProps = ctx.getHiddenSelectProps({ name: ctx.name });

    return (
      <select
        ref={ref}
        {...(hiddenProps as React.SelectHTMLAttributes<HTMLSelectElement>)}
        {...props}
      >
        <option value="" />
        {children}
      </select>
    );
  },
);
