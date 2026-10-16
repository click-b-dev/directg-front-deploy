import { forwardRef } from "react";
import { dataAttr, ariaAttr } from "@/machines/shared";
import type {
  NativeSelectRootProps,
  NativeSelectFieldProps,
  NativeSelectIconProps,
} from "./native-select.types";

const SCOPE = "native-select";

const Root = forwardRef<HTMLDivElement, NativeSelectRootProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="root" {...props} />;
});
Root.displayName = "NativeSelect.Root";

const Field = forwardRef<HTMLSelectElement, NativeSelectFieldProps>(
  ({ disabled, invalid, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        data-scope={SCOPE}
        data-part="field"
        data-disabled={dataAttr(!!disabled)}
        data-invalid={dataAttr(!!invalid)}
        aria-invalid={invalid ? ariaAttr(true) : undefined}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Field.displayName = "NativeSelect.Field";

const Icon = forwardRef<HTMLDivElement, NativeSelectIconProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="icon" aria-hidden="true" {...props} />;
});
Icon.displayName = "NativeSelect.Icon";

export const NativeSelect = { Root, Field, Icon };
