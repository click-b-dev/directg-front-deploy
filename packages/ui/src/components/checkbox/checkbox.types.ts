import type { ComponentPropsWithRef, ReactNode } from "react";
import type { CheckedState } from "@/machines/checkbox";

export interface CheckboxRootProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "defaultChecked"
> {
  /** controlled checked 상태 */
  checked?: CheckedState;
  /** uncontrolled 기본 checked 상태 */
  defaultChecked?: CheckedState;
  /** checked 변경 콜백 */
  onCheckedChange?: (checked: CheckedState) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 폼 필드 값 */
  value?: string;
  /** 자식 요소 */
  children?: ReactNode;
}

export type CheckboxControlProps = ComponentPropsWithRef<"div">;

export type CheckboxLabelProps = ComponentPropsWithRef<"label">;

export type CheckboxIndicatorProps = ComponentPropsWithRef<"span">;

export type CheckboxHiddenInputProps = ComponentPropsWithRef<"input">;
