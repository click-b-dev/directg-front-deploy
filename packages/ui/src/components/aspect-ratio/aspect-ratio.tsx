/**
 * [Machine: 불필요] 비율 유지 래퍼. 상태 전이 없음
 */

import type { CSSProperties } from "react";
import { forwardRef } from "react";
import type { AspectRatioRootProps } from "./aspect-ratio.types";

const SCOPE = "aspect-ratio";

const Root = forwardRef<HTMLDivElement, AspectRatioRootProps>(
  ({ ratio = 1, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-scope={SCOPE}
        data-part="root"
        style={
          {
            position: "relative",
            "--aspect-ratio": String(ratio),
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        <div
          data-scope={SCOPE}
          data-part="content"
          style={{
            position: "absolute",
            inset: 0,
          }}
        >
          {children}
        </div>
        <div
          style={{
            height: 0,
            paddingBottom: `${(1 / ratio) * 100}%`,
          }}
        />
      </div>
    );
  },
);

Root.displayName = "AspectRatio.Root";

export const AspectRatio = { Root };
