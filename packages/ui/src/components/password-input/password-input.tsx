import { createContext, forwardRef, useCallback, useContext, useMemo, useState } from "react";
import { dataAttr, ariaAttr } from "@/machines/shared";
import type {
  PasswordInputRootProps,
  PasswordInputInputProps,
  PasswordInputVisibilityTriggerProps,
} from "./password-input.types";

const SCOPE = "password-input";

interface PasswordInputContextValue {
  visible: boolean;
  toggle: () => void;
}

const PasswordInputContext = createContext<PasswordInputContextValue | null>(null);

const usePasswordInputContext = (): PasswordInputContextValue => {
  const ctx = useContext(PasswordInputContext);
  if (!ctx) {
    throw new Error("PasswordInput compound components must be used within PasswordInput.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, PasswordInputRootProps>(({ children, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  const ctxValue = useMemo(() => ({ visible, toggle }), [visible, toggle]);

  return (
    <PasswordInputContext.Provider value={ctxValue}>
      <div
        ref={ref}
        data-scope={SCOPE}
        data-part="root"
        data-visible={visible ? "true" : "false"}
        {...props}
      >
        {children}
      </div>
    </PasswordInputContext.Provider>
  );
});
Root.displayName = "PasswordInput.Root";

const Input = forwardRef<HTMLInputElement, PasswordInputInputProps>(
  ({ invalid, disabled, ...props }, ref) => {
    const { visible } = usePasswordInputContext();

    return (
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        data-scope={SCOPE}
        data-part="input"
        data-disabled={dataAttr(!!disabled)}
        data-invalid={dataAttr(!!invalid)}
        aria-invalid={invalid ? ariaAttr(true) : undefined}
        disabled={disabled}
        {...props}
      />
    );
  },
);
Input.displayName = "PasswordInput.Input";

const VisibilityTrigger = forwardRef<HTMLButtonElement, PasswordInputVisibilityTriggerProps>(
  ({ showLabel = "Show password", hideLabel = "Hide password", children, ...props }, ref) => {
    const { visible, toggle } = usePasswordInputContext();

    return (
      <button
        ref={ref}
        type="button"
        data-scope={SCOPE}
        data-part="visibility-trigger"
        data-visible={visible ? "true" : "false"}
        aria-label={visible ? hideLabel : showLabel}
        onClick={toggle}
        {...props}
      >
        {typeof children === "function" ? children(visible) : children}
      </button>
    );
  },
);
VisibilityTrigger.displayName = "PasswordInput.VisibilityTrigger";

export const PasswordInput = { Root, Input, VisibilityTrigger };
