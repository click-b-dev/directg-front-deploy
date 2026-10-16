import type { ComponentPropsWithRef } from "react";

export interface LabelProps extends ComponentPropsWithRef<"label"> {
  /**
   * label이 비활성화된 상태인지 여부
   */
  disabled?: boolean;
}
