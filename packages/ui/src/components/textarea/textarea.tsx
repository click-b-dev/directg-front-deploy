import { forwardRef } from "react";
import { dataAttr, ariaAttr } from "@/machines/shared";
import type { TextareaProps } from "./textarea.types";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const { invalid, disabled, ...restProps } = props;

  return (
    <textarea
      ref={ref}
      data-scope="textarea"
      data-part="root"
      data-disabled={dataAttr(!!disabled)}
      data-invalid={dataAttr(!!invalid)}
      aria-invalid={invalid ? ariaAttr(true) : undefined}
      disabled={disabled}
      {...restProps}
    />
  );
});
