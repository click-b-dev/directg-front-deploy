import type { ComponentPropsWithRef, ReactNode } from "react";

export interface AspectRatioRootProps extends ComponentPropsWithRef<"div"> {
  /** 종횡비 (예: 16/9, 4/3, 1) */
  ratio?: number;
  /** 자식 요소 */
  children?: ReactNode;
}
