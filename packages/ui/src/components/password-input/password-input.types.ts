import type { ComponentPropsWithRef, ReactNode } from "react";

export interface PasswordInputRootProps extends ComponentPropsWithRef<"div"> {
  /** 자식 요소 */
  children?: ReactNode;
}

export interface PasswordInputInputProps extends ComponentPropsWithRef<"input"> {
  /** 유효하지 않은 입력 상태인지 여부 */
  invalid?: boolean;
}

export interface PasswordInputVisibilityTriggerProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children"
> {
  /** 버튼 aria-label (비밀번호 표시 시) */
  showLabel?: string;
  /** 버튼 aria-label (비밀번호 숨김 시) */
  hideLabel?: string;
  /** 자식 요소 (아이콘 등) - visible 상태를 받는 render prop 또는 ReactNode */
  children?: ReactNode | ((visible: boolean) => ReactNode);
}
