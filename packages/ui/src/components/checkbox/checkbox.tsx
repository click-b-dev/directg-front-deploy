import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine, useId } from "@/hooks";
import { mergeProps } from "@/machines/shared";
import { createCheckboxMachine, connectCheckbox } from "@/machines/checkbox";
import type { CheckboxApi, CheckedState } from "@/machines/checkbox";
import type {
  CheckboxRootProps,
  CheckboxControlProps,
  CheckboxLabelProps,
  CheckboxIndicatorProps,
  CheckboxHiddenInputProps,
} from "./checkbox.types";

const CheckboxContext = createContext<CheckboxApi | null>(null);

const useCheckboxContext = (): CheckboxApi => {
  const ctx = useContext(CheckboxContext);
  if (!ctx) {
    throw new Error("Checkbox compound components must be used within Checkbox.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, CheckboxRootProps>((props, ref) => {
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

  const isControlled = controlledChecked !== undefined;

  // 머신은 단 한 번만 생성한다. useMachine 은 store 를 최초 1회만 시드하므로
  // checked 가 바뀔 때마다 머신을 재생성하면 store 의 context 와 영구히 어긋나
  // controlled 동기화가 무한 루프가 된다. 이후 변경은 SET_CHECKED/SET_CONTEXT 로 동기화.
  const machine = useMemo(
    () =>
      createCheckboxMachine({
        checked: isControlled ? (controlledChecked as CheckedState) : defaultChecked,
        disabled,
        readOnly,
        required,
        name,
        value,
      }),
    [],
  );

  const [state, context, send] = useMachine(machine);

  // 외부 비-checked props 동기화
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { disabled, readOnly, required, name, value } });
  }, [disabled, readOnly, required, name, value, send]);

  // controlled: prop 이 진실. 머신을 prop 에 종속시킨다(데이터/ARIA 정합용).
  // 사용자 인터랙션은 머신을 직접 토글하지 않고 onChange 로만 알리므로(아래 resolvedApi)
  // 여기서 다시 밖으로 echo 하지 않는다 → 피드백 루프 없음.
  useEffect(() => {
    if (isControlled && controlledChecked !== context.checked) {
      send({ type: "SET_CHECKED", checked: controlledChecked as CheckedState });
    }
  }, [isControlled, controlledChecked, context.checked, send]);

  // uncontrolled: 머신이 진실. 사용자 토글로 값이 바뀌면 외부에 1회 알린다.
  const lastEmitted = useRef<CheckedState>(context.checked);
  useEffect(() => {
    if (isControlled) return;
    if (context.checked !== lastEmitted.current) {
      lastEmitted.current = context.checked;
      onCheckedChange?.(context.checked);
    }
  }, [isControlled, context.checked, onCheckedChange]);

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

  const api = connectCheckbox(state, context, send, ids);

  // controlled: 사용자 인터랙션이 머신을 직접 바꾸지 않고 onChange 로만 알린다.
  // 부모가 prop 을 갱신 → 위 effect 가 머신 동기화. uncontrolled 는 기존 동작 유지.
  const resolvedApi = useMemo<CheckboxApi>(() => {
    if (!isControlled) return api;
    const requestToggle = () => {
      if (disabled || readOnly) return;
      const cur = controlledChecked as CheckedState;
      onCheckedChange?.(cur === "indeterminate" ? true : !cur);
    };
    return {
      ...api,
      toggle: requestToggle,
      setChecked: (next: CheckedState) => onCheckedChange?.(next),
      getControlProps: () => ({
        ...api.getControlProps(),
        onClick: requestToggle,
        onKeyDown: (event: KeyboardEvent) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            requestToggle();
          }
        },
      }),
      getHiddenInputProps: () => ({
        ...api.getHiddenInputProps(),
        checked: controlledChecked === true,
        onChange: requestToggle,
      }),
    };
  }, [api, isControlled, controlledChecked, disabled, readOnly, onCheckedChange]);

  const rootProps = resolvedApi.getRootProps();

  return (
    <CheckboxContext.Provider value={resolvedApi}>
      <div ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </CheckboxContext.Provider>
  );
});

const Control = forwardRef<HTMLDivElement, CheckboxControlProps>((props, ref) => {
  const api = useCheckboxContext();
  const controlProps = api.getControlProps();

  return <div ref={ref} {...mergeProps(controlProps as Record<string, unknown>, props)} />;
});

const CheckboxLabel = forwardRef<HTMLLabelElement, CheckboxLabelProps>((props, ref) => {
  const api = useCheckboxContext();
  const labelProps = api.getLabelProps();

  return <label ref={ref} {...mergeProps(labelProps as Record<string, unknown>, props)} />;
});

const Indicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>((props, ref) => {
  const api = useCheckboxContext();
  const indicatorProps = api.getIndicatorProps();

  return <span ref={ref} {...mergeProps(indicatorProps as Record<string, unknown>, props)} />;
});

const HiddenInput = forwardRef<HTMLInputElement, CheckboxHiddenInputProps>((props, ref) => {
  const api = useCheckboxContext();
  const hiddenInputProps = api.getHiddenInputProps();

  return <input ref={ref} {...mergeProps(hiddenInputProps as Record<string, unknown>, props)} />;
});

export const Checkbox = {
  Root,
  Control,
  Label: CheckboxLabel,
  Indicator,
  HiddenInput,
};
