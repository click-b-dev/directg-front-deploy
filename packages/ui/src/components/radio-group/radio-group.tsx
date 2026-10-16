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
import { createRadioGroupMachine, connectRadioGroup } from "@/machines/radio-group";
import type { RadioGroupApi } from "@/machines/radio-group";
import type {
  RadioGroupRootProps,
  RadioGroupItemProps,
  RadioGroupItemControlProps,
  RadioGroupItemTextProps,
  RadioGroupItemHiddenInputProps,
  RadioGroupIndicatorProps,
} from "./radio-group.types";

interface RadioGroupContextValue {
  api: RadioGroupApi;
  registerItem: (value: string) => void;
  unregisterItem: (value: string) => void;
}

interface RadioGroupItemContextValue {
  value: string;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
const RadioGroupItemContext = createContext<RadioGroupItemContextValue | null>(null);

const useRadioGroupContext = (): RadioGroupContextValue => {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error("RadioGroup compound components must be used within RadioGroup.Root");
  }
  return ctx;
};

const useRadioGroupItemContext = (): RadioGroupItemContextValue => {
  const ctx = useContext(RadioGroupItemContext);
  if (!ctx) {
    throw new Error("RadioGroup.Item* components must be used within RadioGroup.Item");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    orientation = "vertical",
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
      createRadioGroupMachine({
        value,
        disabled,
        readOnly,
        required,
        name,
        orientation,
        loop,
      }),
    [value, disabled, readOnly, required, name, orientation, loop],
  );

  const [state, context, send] = useMachine(machine);

  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { disabled, readOnly, required, name, orientation, loop },
    });
  }, [disabled, readOnly, required, name, orientation, loop, send]);

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

  // 아이템 값 목록을 추적하기 위한 ref
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

  const api = connectRadioGroup(state, context, send, {
    root: baseId,
    items: itemValuesRef.current,
  });

  const rootProps = api.getRootProps();

  const ctxValue = useMemo(
    () => ({ api, registerItem, unregisterItem }),
    [api, registerItem, unregisterItem],
  );

  return (
    <RadioGroupContext.Provider value={ctxValue}>
      <div ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

const Item = forwardRef<HTMLDivElement, RadioGroupItemProps>((props, ref) => {
  const { value, disabled, children, ...restProps } = props;
  const { api, registerItem, unregisterItem } = useRadioGroupContext();

  useEffect(() => {
    registerItem(value);
    return () => unregisterItem(value);
  }, [value, registerItem, unregisterItem]);

  const itemProps = api.getItemProps({ value, disabled });

  const itemCtxValue = useMemo(() => ({ value, disabled }), [value, disabled]);

  return (
    <RadioGroupItemContext.Provider value={itemCtxValue}>
      <div ref={ref} {...mergeProps(itemProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </RadioGroupItemContext.Provider>
  );
});

const ItemControl = forwardRef<HTMLDivElement, RadioGroupItemControlProps>((props, ref) => {
  const { api } = useRadioGroupContext();
  const { value, disabled } = useRadioGroupItemContext();
  const controlProps = api.getItemControlProps({ value, disabled });

  return <div ref={ref} {...mergeProps(controlProps as Record<string, unknown>, props)} />;
});

const ItemText = forwardRef<HTMLSpanElement, RadioGroupItemTextProps>((props, ref) => {
  const { api } = useRadioGroupContext();
  const { value, disabled } = useRadioGroupItemContext();
  const textProps = api.getItemTextProps({ value, disabled });

  return <span ref={ref} {...mergeProps(textProps as Record<string, unknown>, props)} />;
});

const ItemHiddenInput = forwardRef<HTMLInputElement, RadioGroupItemHiddenInputProps>(
  (props, ref) => {
    const { api } = useRadioGroupContext();
    const { value, disabled } = useRadioGroupItemContext();
    const hiddenInputProps = api.getItemHiddenInputProps({ value, disabled });

    return <input ref={ref} {...mergeProps(hiddenInputProps as Record<string, unknown>, props)} />;
  },
);

const Indicator = forwardRef<HTMLDivElement, RadioGroupIndicatorProps>((props, ref) => {
  const { api } = useRadioGroupContext();
  const indicatorProps = api.getIndicatorProps();

  return <div ref={ref} {...mergeProps(indicatorProps as Record<string, unknown>, props)} />;
});

export const RadioGroup = {
  Root,
  Item,
  ItemControl,
  ItemText,
  ItemHiddenInput,
  Indicator,
};
