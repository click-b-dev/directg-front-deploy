import { useCallback, useState } from "react";

interface UseBooleanReturn {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

/**
 * boolean 상태를 관리하는 훅.
 * Dialog open/close, 토글 UI 등 반복되는 boolean 패턴을 캡슐화한다.
 *
 * @example
 * const dialog = useBoolean();
 *
 * <DialogRoot open={dialog.value}>
 *   <DialogTrigger onClick={dialog.setTrue}>열기</DialogTrigger>
 *   <DialogContent>
 *     <DialogClose onClick={dialog.setFalse}>닫기</DialogClose>
 *   </DialogContent>
 * </DialogRoot>
 */
export const useBoolean = (initialValue = false): UseBooleanReturn => {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return { value, setTrue, setFalse, toggle };
};
