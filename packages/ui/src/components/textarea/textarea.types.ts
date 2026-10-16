import type { ComponentPropsWithRef } from "react";

export interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  /**
   * 유효하지 않은 입력 상태인지 여부
   */
  invalid?: boolean;
}
