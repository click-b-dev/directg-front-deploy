/**
 * Toggle — aria-pressed 토글 버튼
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 * 머신 불필요 — 단순 boolean 상태.
 */

import { forwardRef } from "react";
import { useControllable } from "@/hooks";
import { dataAttr, composeEventHandlers } from "@/machines/shared";
import type { ToggleRootProps } from "./toggle.types";

export const Toggle = forwardRef<HTMLButtonElement, ToggleRootProps>((props, ref) => {
  const {
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    disabled = false,
    children,
    onClick,
    ...restProps
  } = props;

  const [pressed, setPressed] = useControllable<boolean>({
    value: controlledPressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  const handleClick = composeEventHandlers(onClick, () => {
    if (!disabled) {
      setPressed(!pressed);
    }
  });

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      data-scope="toggle"
      data-part="root"
      data-state={pressed ? "on" : "off"}
      data-disabled={dataAttr(disabled)}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </button>
  );
});
