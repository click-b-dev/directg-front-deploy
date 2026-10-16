import type { ComponentPropsWithRef } from "react";

export type Orientation = "horizontal" | "vertical";

export interface SeparatorRootProps extends ComponentPropsWithRef<"div"> {
  /** 구분선 방향 */
  orientation?: Orientation;
  /** true이면 role="none"으로 장식용 구분선 */
  decorative?: boolean;
}
