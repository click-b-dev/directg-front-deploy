import type { ComponentPropsWithRef, ReactNode } from "react";

export interface FieldRootProps extends ComponentPropsWithRef<"div"> {
  /** 유효하지 않은 상태 여부 */
  invalid?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export type FieldLabelProps = ComponentPropsWithRef<"label">;

export type FieldInputProps = ComponentPropsWithRef<"input">;

export type FieldTextareaProps = ComponentPropsWithRef<"textarea">;

export type FieldSelectProps = ComponentPropsWithRef<"select">;

export type FieldHelperTextProps = ComponentPropsWithRef<"div">;

export type FieldErrorTextProps = ComponentPropsWithRef<"div">;
