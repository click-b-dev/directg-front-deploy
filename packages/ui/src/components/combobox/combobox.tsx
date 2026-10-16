/**
 * Combobox — WAI-ARIA Combobox 패턴 Compound Component
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@/hooks";
import { useControllable } from "@/hooks";
import { useId } from "@/hooks";
import { createComboboxMachine, connect } from "@/machines/combobox";
import type { ComboboxItem as ComboboxItemType } from "@/machines/combobox";
import type {
  ComboboxRootProps,
  ComboboxLabelProps,
  ComboboxControlProps,
  ComboboxInputProps,
  ComboboxTriggerProps,
  ComboboxClearTriggerProps,
  ComboboxPositionerProps,
  ComboboxContentProps,
  ComboboxItemProps,
  ComboboxItemTextProps,
  ComboboxItemIndicatorProps,
  ComboboxItemGroupProps,
  ComboboxItemGroupLabelProps,
  ComboboxContextValue,
} from "./combobox.types";

/* ─── React Context ─── */

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

const useComboboxContext = (): ComboboxContextValue => {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error("Combobox compound components must be used within <Combobox.Root>");
  return ctx;
};

/* ─── Default filter ─── */

const defaultFilter = (item: ComboboxItemType, inputValue: string): boolean => {
  if (!inputValue) return true;
  return item.label.toLowerCase().includes(inputValue.toLowerCase());
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, ComboboxRootProps>(
  (
    {
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      inputValue: controlledInputValue,
      onInputValueChange,
      onOpenChange,
      items: propItems = [],
      disabled = false,
      readOnly = false,
      multiple = false,
      filter = defaultFilter,
      openOnInput = true,
      children,
      ...props
    },
    ref,
  ) => {
    const id = useId();

    const [value, setValue] = useControllable({
      value: controlledValue,
      defaultValue,
      onChange: onValueChange,
    });

    const machine = useMemo(
      () =>
        createComboboxMachine({
          id,
          value,
          items: propItems,
          disabled,
          readOnly,
          multiple,
          openOnInput,
        }),
      [id],
    );

    const [state, ctx, send] = useMachine(machine);

    // 외부 value -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_VALUE", value });
    }, [value, send]);

    // 외부 items -> 머신 동기화
    useEffect(() => {
      send({ type: "SET_ITEMS", items: propItems });
    }, [propItems, send]);

    // controlled inputValue -> 머신 동기화
    useEffect(() => {
      if (controlledInputValue !== undefined) {
        send({ type: "SET_INPUT_VALUE", value: controlledInputValue });
      }
    }, [controlledInputValue, send]);

    // 머신 value -> 외부 동기화
    const prevMachineValue = useRef(ctx.value);
    useEffect(() => {
      if (ctx.value !== prevMachineValue.current) {
        prevMachineValue.current = ctx.value;
        setValue(ctx.value);
      }
    }, [ctx.value, setValue]);

    // 머신 inputValue -> 외부 동기화
    const prevInputValue = useRef(ctx.inputValue);
    useEffect(() => {
      if (ctx.inputValue !== prevInputValue.current) {
        prevInputValue.current = ctx.inputValue;
        onInputValueChange?.(ctx.inputValue);
      }
    }, [ctx.inputValue, onInputValueChange]);

    // 필터링: inputValue 변경 시 필터된 아이템 업데이트
    useEffect(() => {
      const filtered = propItems.filter((item) => filter(item, ctx.inputValue));
      send({ type: "SET_FILTERED_ITEMS", items: filtered });
    }, [ctx.inputValue, propItems, filter, send]);

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

    const ctxValue = useMemo<ComboboxContextValue>(
      () => ({
        value: ctx.value,
        inputValue: ctx.inputValue,
        highlightedValue: ctx.highlightedValue,
        open: state === "open",
        multiple,
        getRootProps: api.getRootProps,
        getLabelProps: api.getLabelProps,
        getControlProps: api.getControlProps,
        getInputProps: api.getInputProps,
        getTriggerProps: api.getTriggerProps,
        getClearTriggerProps: api.getClearTriggerProps,
        getPositionerProps: api.getPositionerProps,
        getContentProps: api.getContentProps,
        getItemProps: api.getItemProps,
        getItemTextProps: api.getItemTextProps,
        getItemIndicatorProps: api.getItemIndicatorProps,
        getItemGroupProps: api.getItemGroupProps,
        getItemGroupLabelProps: api.getItemGroupLabelProps,
      }),
      [ctx.value, ctx.inputValue, ctx.highlightedValue, state, multiple, api],
    );

    const rootProps = api.getRootProps();

    return (
      <ComboboxContext.Provider value={ctxValue}>
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
      </ComboboxContext.Provider>
    );
  },
);

/* ─── Label ─── */

export const Label = forwardRef<HTMLLabelElement, ComboboxLabelProps>(
  ({ children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const labelProps = ctx.getLabelProps();

    return (
      <label ref={ref} {...(labelProps as React.LabelHTMLAttributes<HTMLLabelElement>)} {...props}>
        {children}
      </label>
    );
  },
);

/* ─── Control ─── */

export const Control = forwardRef<HTMLDivElement, ComboboxControlProps>(
  ({ children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const controlProps = ctx.getControlProps();

    return (
      <div ref={ref} {...(controlProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Input ─── */

export const Input = forwardRef<HTMLInputElement, ComboboxInputProps>((props, ref) => {
  const ctx = useComboboxContext();
  const inputProps = ctx.getInputProps();

  return (
    <input ref={ref} {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)} {...props} />
  );
});

/* ─── Trigger ─── */

export const Trigger = forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useComboboxContext();
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

/* ─── ClearTrigger ─── */

export const ClearTrigger = forwardRef<HTMLButtonElement, ComboboxClearTriggerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const clearProps = ctx.getClearTriggerProps();

    return (
      <button
        ref={ref}
        {...(clearProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* ─── Positioner ─── */

export const Positioner = forwardRef<HTMLDivElement, ComboboxPositionerProps>(
  ({ children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const positionerProps = ctx.getPositionerProps();

    return (
      <div ref={ref} {...(positionerProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Content ─── */

export const Content = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const contentProps = ctx.getContentProps();

    return (
      <div ref={ref} {...(contentProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Item ─── */

export const Item = forwardRef<HTMLDivElement, ComboboxItemProps>(
  ({ value, disabled = false, children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const itemProps = ctx.getItemProps({ value, disabled });

    return (
      <div ref={ref} {...(itemProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ItemText ─── */

export const ItemText = forwardRef<HTMLSpanElement, ComboboxItemTextProps>(
  ({ children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const itemTextProps = ctx.getItemTextProps();

    return (
      <span ref={ref} {...(itemTextProps as React.HTMLAttributes<HTMLSpanElement>)} {...props}>
        {children}
      </span>
    );
  },
);

/* ─── ItemIndicator ─── */

export const ItemIndicator = forwardRef<HTMLSpanElement, ComboboxItemIndicatorProps>(
  ({ children, ...props }, ref) => {
    // ItemIndicator needs to know which item it belongs to.
    // We use the closest Item's value from data-value attribute via DOM.
    // For simplicity, we accept value prop via parent context.
    const ctx = useComboboxContext();

    // This component must be used inside an Item, so we look up the closest data-value
    const indicatorRef = useRef<HTMLSpanElement>(null);

    // We can't call getParentValue during render, so we use a wrapper
    return (
      <span
        ref={(node) => {
          (indicatorRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLSpanElement | null>).current = node;
        }}
        {...props}
      >
        <ItemIndicatorInner ctx={ctx} indicatorRef={indicatorRef}>
          {children}
        </ItemIndicatorInner>
      </span>
    );
  },
);

const ItemIndicatorInner = ({
  ctx,
  indicatorRef,
  children,
}: {
  ctx: ComboboxContextValue;
  indicatorRef: React.RefObject<HTMLSpanElement | null>;
  children?: React.ReactNode;
}) => {
  const parentValue =
    indicatorRef.current?.closest("[data-value]")?.getAttribute("data-value") ?? "";
  const indicatorProps = ctx.getItemIndicatorProps({ value: parentValue });

  return <span {...(indicatorProps as React.HTMLAttributes<HTMLSpanElement>)}>{children}</span>;
};

/* ─── ItemGroup ─── */

export const ItemGroup = forwardRef<HTMLDivElement, ComboboxItemGroupProps>(
  ({ id: groupId, children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const groupProps = ctx.getItemGroupProps({ id: groupId });

    return (
      <div ref={ref} {...(groupProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);

/* ─── ItemGroupLabel ─── */

export const ItemGroupLabel = forwardRef<HTMLDivElement, ComboboxItemGroupLabelProps>(
  ({ htmlFor, children, ...props }, ref) => {
    const ctx = useComboboxContext();
    const labelProps = ctx.getItemGroupLabelProps({ htmlFor });

    return (
      <div ref={ref} {...(labelProps as React.HTMLAttributes<HTMLDivElement>)} {...props}>
        {children}
      </div>
    );
  },
);
