import { forwardRef } from "react";
import { dataAttr } from "@/machines/shared";
import type { ButtonProps } from "./button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { pressed, disabled, children, ...restProps } = props;

  const isToggle = pressed !== undefined;

  return (
    <button
      ref={ref}
      type={restProps.type ?? "button"}
      data-scope="button"
      data-part="root"
      data-state={isToggle ? (pressed ? "on" : "off") : undefined}
      data-disabled={dataAttr(!!disabled)}
      aria-pressed={isToggle ? pressed : undefined}
      aria-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </button>
  );
});
