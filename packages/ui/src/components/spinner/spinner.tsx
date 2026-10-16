/**
 * [Machine: 불필요] 로딩 인디케이터. 상태 전이 없음
 */

import { forwardRef } from "react";
import type { SpinnerRootProps } from "./spinner.types";

const SCOPE = "spinner";

const Root = forwardRef<HTMLDivElement, SpinnerRootProps>(
  ({ label = "Loading", size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        data-scope={SCOPE}
        data-part="root"
        data-size={size}
        {...props}
      >
        {children}
        <span
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: "0",
          }}
        >
          {label}
        </span>
      </div>
    );
  },
);

Root.displayName = "Spinner.Root";

export const Spinner = { Root };
