import type { ComponentPropsWithRef, ReactNode } from "react";

export interface ScrollAreaRootProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface ScrollAreaViewportProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface ScrollAreaScrollbarProps extends ComponentPropsWithRef<"div"> {
  /** 스크롤바 방향 */
  orientation?: "vertical" | "horizontal";
  children?: ReactNode;
}

export type ScrollAreaThumbProps = ComponentPropsWithRef<"div">;

export type ScrollAreaCornerProps = ComponentPropsWithRef<"div">;
