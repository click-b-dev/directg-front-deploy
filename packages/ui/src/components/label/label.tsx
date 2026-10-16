import { forwardRef } from "react";
import { dataAttr } from "@/machines/shared";
import type { LabelProps } from "./label.types";

export const Label = forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
  const { disabled, children, ...restProps } = props;

  return (
    <label
      ref={ref}
      data-scope="label"
      data-part="root"
      data-disabled={dataAttr(!!disabled)}
      {...restProps}
    >
      {children}
    </label>
  );
});
