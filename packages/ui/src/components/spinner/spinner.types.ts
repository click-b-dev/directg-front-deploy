import type { ComponentPropsWithRef, ReactNode } from "react";

export interface SpinnerRootProps extends ComponentPropsWithRef<"div"> {
  /** 스크린리더에 표시될 라벨 */
  label?: string;
  /** 사이즈 (data-size 속성으로 노출) */
  size?: string;
  /** 자식 요소 (커스텀 스피너 아이콘 등) */
  children?: ReactNode;
}
