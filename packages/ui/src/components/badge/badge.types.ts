import type { ComponentPropsWithRef } from "react";

export interface BadgeRootProps extends ComponentPropsWithRef<"span"> {
  /** 배지 변형 (data-variant 속성으로 노출) */
  variant?: string;
}
