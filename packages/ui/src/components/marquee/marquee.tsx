/**
 * [Machine: 불필요] 스크롤 텍스트. CSS 애니메이션 기반, 상태 전이 없음
 */

import type { CSSProperties } from "react";
import { forwardRef } from "react";
import type { MarqueeRootProps } from "./marquee.types";

const SCOPE = "marquee";

const Root = forwardRef<HTMLDivElement, MarqueeRootProps>(
  ({ direction = "left", speed = 20, paused = false, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-scope={SCOPE}
        data-part="root"
        data-direction={direction}
        data-paused={paused ? "" : undefined}
        aria-live="off"
        style={
          {
            "--marquee-speed": `${speed}s`,
            "--marquee-direction": direction,
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        <div data-scope={SCOPE} data-part="content">
          {children}
        </div>
      </div>
    );
  },
);

Root.displayName = "Marquee.Root";

export const Marquee = { Root };
