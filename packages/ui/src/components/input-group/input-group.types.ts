import type { ComponentPropsWithRef, ReactNode } from "react";

export interface InputGroupRootProps extends ComponentPropsWithRef<"div"> {
  /** 자식 요소 */
  children?: ReactNode;
}

export interface InputGroupAddonProps extends ComponentPropsWithRef<"div"> {
  /** 위치 (시작/끝) */
  placement?: "start" | "end";
  /** 자식 요소 */
  children?: ReactNode;
}

export interface InputGroupElementProps extends ComponentPropsWithRef<"div"> {
  /** 위치 (시작/끝) */
  placement?: "start" | "end";
  /** 자식 요소 (아이콘 등) */
  children?: ReactNode;
}
