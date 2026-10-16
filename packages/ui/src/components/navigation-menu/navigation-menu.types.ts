import type { ComponentPropsWithRef, ReactNode } from "react";

export interface NavigationMenuRootProps extends Omit<
  ComponentPropsWithRef<"nav">,
  "defaultValue"
> {
  /** controlled 열린 메뉴 값 */
  value?: string | null;
  /** uncontrolled 기본 열린 메뉴 값 */
  defaultValue?: string | null;
  /** 열린 메뉴 값 변경 콜백 */
  onValueChange?: (value: string | null) => void;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 자식 요소 */
  children?: ReactNode;
}

export interface NavigationMenuListProps extends ComponentPropsWithRef<"ul"> {
  /** 자식 요소 */
  children?: ReactNode;
}

export interface NavigationMenuItemProps extends ComponentPropsWithRef<"li"> {
  /** 아이템 값 (필수) */
  value: string;
  /** 개별 아이템 비활성화 */
  disabled?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export interface NavigationMenuTriggerProps extends ComponentPropsWithRef<"button"> {
  /** 자식 요소 */
  children?: ReactNode;
}

export interface NavigationMenuContentProps extends ComponentPropsWithRef<"div"> {
  /** 자식 요소 */
  children?: ReactNode;
}

export interface NavigationMenuLinkProps extends ComponentPropsWithRef<"a"> {
  /** 링크 활성 상태 */
  active?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export type NavigationMenuIndicatorProps = ComponentPropsWithRef<"div">;

export type NavigationMenuViewportProps = ComponentPropsWithRef<"div">;

export type NavigationMenuArrowProps = ComponentPropsWithRef<"div">;
