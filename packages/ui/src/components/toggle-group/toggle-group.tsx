/**
 * ToggleGroup — WAI-ARIA 토글 버튼 그룹 Compound Component
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
import { useMachine, useControllable, useId } from "@/hooks";
import { createToggleGroupMachine, connect } from "@/machines/toggle-group";
import type {
  ToggleGroupRootProps,
  ToggleGroupItemProps,
  ToggleGroupContextValue,
} from "./toggle-group.types";

/* ─── React Context ─── */

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

const useToggleGroupContext = (): ToggleGroupContextValue => {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx)
    throw new Error("ToggleGroup compound components must be used within <ToggleGroup.Root>");
  return ctx;
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, ToggleGroupRootProps>((props, ref) => {
  const {
    type = "single",
    orientation = "horizontal",
    loop = true,
    disabled = false,
    children,
    ...restProps
  } = props;

  const isMultiple = type === "multiple";

  const controlledValue = isMultiple
    ? (props as { value?: string[] }).value
    : (props as { value?: string }).value;
  const defaultValue = isMultiple
    ? (props as { defaultValue?: string[] }).defaultValue
    : (props as { defaultValue?: string }).defaultValue;
  const onValueChange = isMultiple
    ? (props as { onValueChange?: (v: string[]) => void }).onValueChange
    : (props as { onValueChange?: (v: string) => void }).onValueChange;

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
  const itemsRef = useRef<string[]>([]);
  const disabledItemsRef = useRef<string[]>([]);

  const machine = useMemo(
    () =>
      createToggleGroupMachine({
        id,
        value,
        multiple: isMultiple,
        disabled,
        orientation,
        loop,
        items: itemsRef.current,
        disabledItems: disabledItemsRef.current,
      }),
    [id, isMultiple, disabled, orientation, loop],
  );

  const [state, ctx, send] = useMachine(machine);

  // 외부 value -> 머신 동기화
  useEffect(() => {
    send({ type: "SET_VALUE", value });
  }, [value, send]);

  // 머신 value -> 외부 동기화
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
    (val: string, itemDisabled: boolean) => {
      if (!itemsRef.current.includes(val)) {
        itemsRef.current = [...itemsRef.current, val];
      }
      if (itemDisabled && !disabledItemsRef.current.includes(val)) {
        disabledItemsRef.current = [...disabledItemsRef.current, val];
      } else if (!itemDisabled) {
        disabledItemsRef.current = disabledItemsRef.current.filter((v) => v !== val);
      }
      send({
        type: "SET_ITEMS",
        items: itemsRef.current,
        disabledItems: disabledItemsRef.current,
      });
    },
    [send],
  );

  const unregisterItem = useCallback(
    (val: string) => {
      itemsRef.current = itemsRef.current.filter((v) => v !== val);
      disabledItemsRef.current = disabledItemsRef.current.filter((v) => v !== val);
      send({
        type: "SET_ITEMS",
        items: itemsRef.current,
        disabledItems: disabledItemsRef.current,
      });
    },
    [send],
  );

  const ctxValue = useMemo<ToggleGroupContextValue>(
    () => ({
      getItemProps: api.getItemProps,
      registerItem,
      unregisterItem,
    }),
    [api, registerItem, unregisterItem],
  );

  const rootProps = api.getRootProps();

  // restProps에서 전용 props 제거
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    value: _v,
    defaultValue: _dv,
    onValueChange: _ovc,
    type: _t,
    loop: _l,
    ...htmlProps
  } = restProps as Record<string, unknown>;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <ToggleGroupContext.Provider value={ctxValue}>
      <div ref={ref} {...rootProps} {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
});

/* ─── Item ─── */

export const Item = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, disabled = false, children, ...props }, ref) => {
    const ctx = useToggleGroupContext();

    useEffect(() => {
      ctx.registerItem(value, disabled);
      return () => ctx.unregisterItem(value);
    }, [value, disabled]);

    const itemProps = ctx.getItemProps({ value, disabled });

    return (
      <button
        ref={ref}
        {...(itemProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
