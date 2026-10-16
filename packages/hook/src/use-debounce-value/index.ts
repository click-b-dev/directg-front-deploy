import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/** debounce source state를 갱신하는 setter. 일반 state setter처럼 값 또는 updater 함수를 받는다. */
export type UseDebounceValueSetter<T> = Dispatch<SetStateAction<T>>;

/**
 * 값의 반영을 delay만큼 늦춰서 반환하는 훅.
 *
 * 인터페이스:
 * - 입력: 초기값, 선택적 debounce delay(ms)
 * - 출력: `[debouncedValue, setSourceValue]`
 * - 동작: setter는 즉시 source state를 바꾸고, 반환값은 delay 후에만 갱신된다
 *
 * use case:
 * - 검색 입력값과 네트워크 요청 트리거 시점을 분리하고 싶을 때
 *
 * @example
 * const [keyword, setKeyword] = useDebounceValue("", 300);
 * useEffect(() => {
 *   search(keyword);
 * }, [keyword]);
 */
export const useDebounceValue = <T>(
  initialValue: T,
  delay = 300,
): [T, UseDebounceValueSetter<T>] => {
  const [sourceValue, setSourceValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(sourceValue);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sourceValue, delay]);

  return [debouncedValue, setSourceValue];
};
