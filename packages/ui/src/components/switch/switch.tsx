import { createContext, forwardRef, useContext, useEffect, useMemo } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { mergeProps } from "@/machines/shared";
import { createSwitchMachine, connectSwitch } from "@/machines/switch";
import type { SwitchApi } from "@/machines/switch";
import type {
  SwitchRootProps,
  SwitchControlProps,
  SwitchThumbProps,
  SwitchLabelProps,
  SwitchHiddenInputProps,
} from "./switch.types";

const SwitchContext = createContext<SwitchApi | null>(null);

const useSwitchContext = (): SwitchApi => {
  const ctx = useContext(SwitchContext);
  if (!ctx) {
    throw new Error("Switch compound components must be used within Switch.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, SwitchRootProps>((props, ref) => {
  const {
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    value = "on",
    children,
    id: customId,
    ...restProps
  } = props;

  const [checked, setChecked] = useControllable<boolean>({
    value: controlledChecked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const machine = useMemo(
    () =>
      createSwitchMachine({
        checked,
        disabled,
        readOnly,
        required,
        name,
        value,
      }),
    [checked, disabled, readOnly, required, name, value],
  );

  const [state, context, send] = useMachine(machine);

  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { disabled, readOnly, required, name, value } });
  }, [disabled, readOnly, required, name, value, send]);

  useEffect(() => {
    if (controlledChecked !== undefined && controlledChecked !== context.checked) {
      send({ type: "SET_CHECKED", checked: controlledChecked });
    }
  }, [controlledChecked, context.checked, send]);

  useEffect(() => {
    if (context.checked !== checked) {
      setChecked(context.checked);
    }
  }, [context.checked, checked, setChecked]);

  const baseId = useId(customId);
  const ids = useMemo(
    () => ({
      root: baseId,
      control: `${baseId}-control`,
      label: `${baseId}-label`,
      input: `${baseId}-input`,
    }),
    [baseId],
  );

  const api = connectSwitch(state, context, send, ids);

  const rootProps = api.getRootProps();

  return (
    <SwitchContext.Provider value={api}>
      <div ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </SwitchContext.Provider>
  );
});

const Control = forwardRef<HTMLDivElement, SwitchControlProps>((props, ref) => {
  const api = useSwitchContext();
  const controlProps = api.getControlProps();

  return <div ref={ref} {...mergeProps(controlProps as Record<string, unknown>, props)} />;
});

const Thumb = forwardRef<HTMLSpanElement, SwitchThumbProps>((props, ref) => {
  const api = useSwitchContext();
  const thumbProps = api.getThumbProps();

  return <span ref={ref} {...mergeProps(thumbProps as Record<string, unknown>, props)} />;
});

const SwitchLabel = forwardRef<HTMLLabelElement, SwitchLabelProps>((props, ref) => {
  const api = useSwitchContext();
  const labelProps = api.getLabelProps();

  return <label ref={ref} {...mergeProps(labelProps as Record<string, unknown>, props)} />;
});

const HiddenInput = forwardRef<HTMLInputElement, SwitchHiddenInputProps>((props, ref) => {
  const api = useSwitchContext();
  const hiddenInputProps = api.getHiddenInputProps();

  return <input ref={ref} {...mergeProps(hiddenInputProps as Record<string, unknown>, props)} />;
});

export const Switch = {
  Root,
  Control,
  Thumb,
  Label: SwitchLabel,
  HiddenInput,
};
