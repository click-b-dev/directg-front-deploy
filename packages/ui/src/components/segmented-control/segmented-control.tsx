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
import { mergeProps } from "@/machines/shared";
import {
  createSegmentedControlMachine,
  connectSegmentedControl,
} from "@/machines/segmented-control";
import type { SegmentedControlApi } from "@/machines/segmented-control";
import type {
  SegmentedControlRootProps,
  SegmentedControlItemProps,
  SegmentedControlItemTextProps,
  SegmentedControlItemHiddenInputProps,
  SegmentedControlIndicatorProps,
} from "./segmented-control.types";

interface SegmentedControlContextValue {
  api: SegmentedControlApi;
  registerItem: (value: string) => void;
  unregisterItem: (value: string) => void;
}

interface SegmentedControlItemContextValue {
  value: string;
  disabled?: boolean;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);
const SegmentedControlItemContext = createContext<SegmentedControlItemContextValue | null>(null);

const useSegmentedControlContext = (): SegmentedControlContextValue => {
  const ctx = useContext(SegmentedControlContext);
  if (!ctx) {
    throw new Error(
      "SegmentedControl compound components must be used within SegmentedControl.Root",
    );
  }
  return ctx;
};

const useSegmentedControlItemContext = (): SegmentedControlItemContextValue => {
  const ctx = useContext(SegmentedControlItemContext);
  if (!ctx) {
    throw new Error("SegmentedControl.Item* components must be used within SegmentedControl.Item");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, SegmentedControlRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled = false,
    name,
    orientation = "horizontal",
    loop = true,
    children,
    id: customId,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<string | null>({
    value: controlledValue ?? undefined,
    defaultValue: defaultValue ?? null,
    onChange: (v) => {
      if (v !== null) onValueChange?.(v);
    },
  });

  const machine = useMemo(
    () =>
      createSegmentedControlMachine({
        value,
        disabled,
        name,
        orientation,
        loop,
      }),
    [value, disabled, name, orientation, loop],
  );

  const [state, context, send] = useMachine(machine);

  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { disabled, name, orientation, loop },
    });
  }, [disabled, name, orientation, loop, send]);

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== context.value) {
      send({ type: "SET_VALUE", value: controlledValue });
    }
  }, [controlledValue, context.value, send]);

  useEffect(() => {
    if (context.value !== value) {
      setValue(context.value);
    }
  }, [context.value, value, setValue]);

  const itemValuesRef = useRef<string[]>([]);
  const registerItem = useCallback((itemValue: string) => {
    if (!itemValuesRef.current.includes(itemValue)) {
      itemValuesRef.current = [...itemValuesRef.current, itemValue];
    }
  }, []);
  const unregisterItem = useCallback((itemValue: string) => {
    itemValuesRef.current = itemValuesRef.current.filter((v) => v !== itemValue);
  }, []);

  const baseId = useId(customId);

  const api = connectSegmentedControl(state, context, send, {
    root: baseId,
    items: itemValuesRef.current,
  });

  const rootProps = api.getRootProps();

  const ctxValue = useMemo(
    () => ({ api, registerItem, unregisterItem }),
    [api, registerItem, unregisterItem],
  );

  return (
    <SegmentedControlContext.Provider value={ctxValue}>
      <div ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
});

const Item = forwardRef<HTMLDivElement, SegmentedControlItemProps>((props, ref) => {
  const { value, disabled, children, ...restProps } = props;
  const { api, registerItem, unregisterItem } = useSegmentedControlContext();

  useEffect(() => {
    registerItem(value);
    return () => unregisterItem(value);
  }, [value, registerItem, unregisterItem]);

  const itemProps = api.getItemProps({ value, disabled });
  const itemCtxValue = useMemo(() => ({ value, disabled }), [value, disabled]);

  return (
    <SegmentedControlItemContext.Provider value={itemCtxValue}>
      <div ref={ref} {...mergeProps(itemProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </SegmentedControlItemContext.Provider>
  );
});

const ItemText = forwardRef<HTMLSpanElement, SegmentedControlItemTextProps>((props, ref) => {
  const { api } = useSegmentedControlContext();
  const { value } = useSegmentedControlItemContext();
  const textProps = api.getItemTextProps({ value });

  return <span ref={ref} {...mergeProps(textProps as Record<string, unknown>, props)} />;
});

const ItemHiddenInput = forwardRef<HTMLInputElement, SegmentedControlItemHiddenInputProps>(
  (props, ref) => {
    const { api } = useSegmentedControlContext();
    const { value, disabled } = useSegmentedControlItemContext();
    const hiddenInputProps = api.getItemHiddenInputProps({ value, disabled });

    return <input ref={ref} {...mergeProps(hiddenInputProps as Record<string, unknown>, props)} />;
  },
);

const Indicator = forwardRef<HTMLDivElement, SegmentedControlIndicatorProps>((props, ref) => {
  const { api } = useSegmentedControlContext();
  const indicatorProps = api.getIndicatorProps();

  return <div ref={ref} {...mergeProps(indicatorProps as Record<string, unknown>, props)} />;
});

export const SegmentedControl = { Root, Item, ItemText, ItemHiddenInput, Indicator };
