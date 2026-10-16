import type { ComponentPropsWithRef } from "react";

export interface InputProps extends ComponentPropsWithRef<"input"> {
  /**
   * 유효하지 않은 입력 상태인지 여부
   */
  invalid?: boolean;
}
