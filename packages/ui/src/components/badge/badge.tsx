/**
 * [Machine: 불필요] 텍스트 표시. 상태 전이 없음
 */

import { forwardRef } from "react";
import type { BadgeRootProps } from "./badge.types";

const SCOPE = "badge";

const Root = forwardRef<HTMLSpanElement, BadgeRootProps>(({ variant, ...props }, ref) => {
  return <span ref={ref} data-scope={SCOPE} data-part="root" data-variant={variant} {...props} />;
});

Root.displayName = "Badge.Root";

export const Badge = { Root };
