import { createContext, forwardRef, useContext, useMemo } from "react";
import { useId } from "@/hooks";
import { dataAttr, ariaAttr } from "@/machines/shared";
import type {
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldSelectProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "./field.types";

const SCOPE = "field";

interface FieldContextValue {
  id: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  helperTextId: string;
  errorTextId: string;
  labelId: string;
}

const FieldContext = createContext<FieldContextValue | null>(null);

const useFieldContext = (): FieldContextValue => {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error("Field compound components must be used within Field.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, FieldRootProps>(
  (
    { invalid = false, disabled = false, required = false, children, id: customId, ...props },
    ref,
  ) => {
    const id = useId(customId);
    const labelId = `${id}:label`;
    const helperTextId = `${id}:helper-text`;
    const errorTextId = `${id}:error-text`;

    const ctxValue = useMemo(
      () => ({ id, invalid, disabled, required, helperTextId, errorTextId, labelId }),
      [id, invalid, disabled, required, helperTextId, errorTextId, labelId],
    );

    return (
      <FieldContext.Provider value={ctxValue}>
        <div
          ref={ref}
          data-scope={SCOPE}
          data-part="root"
          data-invalid={dataAttr(invalid)}
          data-disabled={dataAttr(disabled)}
          {...props}
        >
          {children}
        </div>
      </FieldContext.Provider>
    );
  },
);
Root.displayName = "Field.Root";

const Label = forwardRef<HTMLLabelElement, FieldLabelProps>((props, ref) => {
  const { id, labelId, disabled, required } = useFieldContext();

  return (
    <label
      ref={ref}
      id={labelId}
      htmlFor={id}
      data-scope={SCOPE}
      data-part="label"
      data-disabled={dataAttr(disabled)}
      {...props}
    >
      {props.children}
      {required && (
        <span data-scope={SCOPE} data-part="required-indicator" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
});
Label.displayName = "Field.Label";

const getDescribedBy = (ctx: FieldContextValue): string | undefined => {
  const ids: string[] = [];
  if (ctx.invalid) {
    ids.push(ctx.errorTextId);
  }
  ids.push(ctx.helperTextId);
  return ids.length > 0 ? ids.join(" ") : undefined;
};

const Input = forwardRef<HTMLInputElement, FieldInputProps>((props, ref) => {
  const ctx = useFieldContext();

  return (
    <input
      ref={ref}
      id={ctx.id}
      data-scope={SCOPE}
      data-part="input"
      data-invalid={dataAttr(ctx.invalid)}
      data-disabled={dataAttr(ctx.disabled)}
      aria-invalid={ctx.invalid ? ariaAttr(true) : undefined}
      aria-describedby={getDescribedBy(ctx)}
      aria-required={ctx.required ? ariaAttr(true) : undefined}
      disabled={ctx.disabled}
      required={ctx.required}
      {...props}
    />
  );
});
Input.displayName = "Field.Input";

const Textarea = forwardRef<HTMLTextAreaElement, FieldTextareaProps>((props, ref) => {
  const ctx = useFieldContext();

  return (
    <textarea
      ref={ref}
      id={ctx.id}
      data-scope={SCOPE}
      data-part="textarea"
      data-invalid={dataAttr(ctx.invalid)}
      data-disabled={dataAttr(ctx.disabled)}
      aria-invalid={ctx.invalid ? ariaAttr(true) : undefined}
      aria-describedby={getDescribedBy(ctx)}
      aria-required={ctx.required ? ariaAttr(true) : undefined}
      disabled={ctx.disabled}
      required={ctx.required}
      {...props}
    />
  );
});
Textarea.displayName = "Field.Textarea";

const Select = forwardRef<HTMLSelectElement, FieldSelectProps>((props, ref) => {
  const ctx = useFieldContext();

  return (
    <select
      ref={ref}
      id={ctx.id}
      data-scope={SCOPE}
      data-part="select"
      data-invalid={dataAttr(ctx.invalid)}
      data-disabled={dataAttr(ctx.disabled)}
      aria-invalid={ctx.invalid ? ariaAttr(true) : undefined}
      aria-describedby={getDescribedBy(ctx)}
      aria-required={ctx.required ? ariaAttr(true) : undefined}
      disabled={ctx.disabled}
      required={ctx.required}
      {...props}
    />
  );
});
Select.displayName = "Field.Select";

const HelperText = forwardRef<HTMLDivElement, FieldHelperTextProps>((props, ref) => {
  const { helperTextId, invalid } = useFieldContext();

  return (
    <div
      ref={ref}
      id={helperTextId}
      data-scope={SCOPE}
      data-part="helper-text"
      data-invalid={dataAttr(invalid)}
      {...props}
    />
  );
});
HelperText.displayName = "Field.HelperText";

const ErrorText = forwardRef<HTMLDivElement, FieldErrorTextProps>((props, ref) => {
  const { errorTextId, invalid } = useFieldContext();

  if (!invalid) return null;

  return (
    <div
      ref={ref}
      id={errorTextId}
      data-scope={SCOPE}
      data-part="error-text"
      aria-live="polite"
      {...props}
    />
  );
});
ErrorText.displayName = "Field.ErrorText";

export const Field = { Root, Label, Input, Textarea, Select, HelperText, ErrorText };
