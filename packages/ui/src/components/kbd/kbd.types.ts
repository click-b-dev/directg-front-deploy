import type { ComponentPropsWithRef } from "react";

export interface KbdRootProps extends ComponentPropsWithRef<"kbd"> {
  /** 키보드 단축키 텍스트 */
  children?: React.ReactNode;
}
