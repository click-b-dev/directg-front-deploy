import type { ComponentPropsWithRef, ReactNode } from "react";

export interface SwitchRootProps extends Omit<ComponentPropsWithRef<"div">, "defaultValue"> {
  /** controlled checked 상태 */
  checked?: boolean;
  /** uncontrolled 기본 checked 상태 */
  defaultChecked?: boolean;
  /** checked 변경 콜백 */
  onCheckedChange?: (checked: boolean) => void;
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

export type SwitchControlProps = ComponentPropsWithRef<"div">;

export type SwitchThumbProps = ComponentPropsWithRef<"span">;

export type SwitchLabelProps = ComponentPropsWithRef<"label">;

export type SwitchHiddenInputProps = ComponentPropsWithRef<"input">;
