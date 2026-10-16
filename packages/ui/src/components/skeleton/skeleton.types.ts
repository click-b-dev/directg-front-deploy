import type { ComponentPropsWithRef } from "react";

export interface SkeletonRootProps extends ComponentPropsWithRef<"div"> {
  /** true이면 children을 렌더링, false이면 스켈레톤 표시 */
  loaded?: boolean;
}
