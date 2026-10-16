import { forwardRef } from "react";
import { dataAttr, ariaAttr } from "@/machines/shared";
import type { InputProps } from "./input.types";

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { invalid, disabled, ...restProps } = props;

  return (
    <input
      ref={ref}
      data-scope="input"
      data-part="root"
      data-disabled={dataAttr(!!disabled)}
      data-invalid={dataAttr(!!invalid)}
      aria-invalid={invalid ? ariaAttr(true) : undefined}
      disabled={disabled}
      {...restProps}
    />
  );
});
