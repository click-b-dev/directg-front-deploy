import type { ComponentPropsWithRef, ReactNode } from "react";

export interface NativeSelectRootProps extends ComponentPropsWithRef<"div"> {
  /** 자식 요소 */
  children?: ReactNode;
}

export interface NativeSelectFieldProps extends ComponentPropsWithRef<"select"> {
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 유효하지 않은 상태 여부 */
  invalid?: boolean;
  /** 자식 요소 (option 태그들) */
  children?: ReactNode;
}

export interface NativeSelectIconProps extends ComponentPropsWithRef<"div"> {
  /** 아이콘 요소 */
  children?: ReactNode;
}
