import { useCallback, useRef, useState } from "react";

/**
 * Controlled/Uncontrolled 상태 관리 훅
 * value + onChange → controlled, defaultValue → uncontrolled
 */
export function useControllable<T>(props: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (value: T | ((prev: T) => T)) => void] {
  const { value: controlledValue, defaultValue, onChange } = props;
  const isControlled = controlledValue !== undefined;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const value = isControlled ? controlledValue : uncontrolledValue;

  const valueRef = useRef(value);
  valueRef.current = value;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    const nextValue =
      typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;

    if (!isControlledRef.current) {
      setUncontrolledValue(nextValue);
    }
    onChangeRef.current?.(nextValue);
  }, []);

  return [value, setValue];
}
