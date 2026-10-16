import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

export interface TypographyRootProps extends ComponentPropsWithRef<"p"> {
  /** 렌더링할 HTML 요소 타입 */
  as?: ElementType;
  /** 타이포그래피 변형 (data-variant 속성으로 노출) */
  variant?: string;
  /** 자식 요소 */
  children?: ReactNode;
}
