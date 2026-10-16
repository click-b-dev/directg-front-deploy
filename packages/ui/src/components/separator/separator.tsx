/**
 * [Machine: 불필요] 구분선. 상태 전이 없음
 */

import { forwardRef } from "react";
import type { SeparatorRootProps } from "./separator.types";

const SCOPE = "separator";

const Root = forwardRef<HTMLDivElement, SeparatorRootProps>(
  ({ orientation = "horizontal", decorative = false, ...props }, ref) => {
    const semanticRole = decorative ? "none" : "separator";
    const ariaOrientation = !decorative && orientation === "vertical" ? "vertical" : undefined;

    return (
      <div
        ref={ref}
        role={semanticRole}
        aria-orientation={ariaOrientation}
        data-scope={SCOPE}
        data-part="root"
        data-orientation={orientation}
        {...props}
      />
    );
  },
);

Root.displayName = "Separator.Root";

export const Separator = { Root };
