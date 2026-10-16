/**
 * [Machine: 불필요] 텍스트 스타일링. 상태 전이 없음
 */

import { forwardRef } from "react";
import type { TypographyRootProps } from "./typography.types";

const SCOPE = "typography";

const Root = forwardRef<HTMLElement, TypographyRootProps>(
  ({ as: Component = "p", variant, ...props }, ref) => {
    return (
      <Component ref={ref} data-scope={SCOPE} data-part="root" data-variant={variant} {...props} />
    );
  },
);

Root.displayName = "Typography.Root";

export const Typography = { Root };
