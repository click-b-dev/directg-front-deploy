import type { ComponentPropsWithRef, ReactNode } from "react";

export interface MarqueeRootProps extends ComponentPropsWithRef<"div"> {
  /** 스크롤 방향 */
  direction?: "left" | "right" | "up" | "down";
  /** 애니메이션 속도 (초 단위, CSS duration) */
  speed?: number;
  /** 일시정지 여부 */
  paused?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}
