import type { ComponentPropsWithRef } from "react";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * 토글 버튼으로 사용할 때 눌린 상태 여부
   * undefined이면 일반 버튼, boolean이면 토글 버튼
   */
  pressed?: boolean;
}
