import type { ComponentPropsWithRef, ReactNode } from "react";

export interface EmptyRootProps extends ComponentPropsWithRef<"div"> {
  /** 자식 요소 */
  children?: ReactNode;
}

export interface EmptyIconProps extends ComponentPropsWithRef<"div"> {
  /** 아이콘 요소 */
  children?: ReactNode;
}

export type EmptyTitleProps = ComponentPropsWithRef<"h3">;

export type EmptyDescriptionProps = ComponentPropsWithRef<"p">;

export interface EmptyActionProps extends ComponentPropsWithRef<"div"> {
  /** 액션 버튼 등 */
  children?: ReactNode;
}
