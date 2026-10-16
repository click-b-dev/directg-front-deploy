/**
 * Menu 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface MenuRootProps {
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 제어 모드: 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface MenuTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface MenuPositionerProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface MenuContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface MenuItemProps extends ComponentPropsWithRef<"div"> {
  /** 아이템 고유 ID */
  id: string;
  /** 비활성 여부 */
  disabled?: boolean;
  /** 선택 시 콜백 */
  onSelect?: () => void;
  children: ReactNode;
}

export interface MenuItemGroupProps extends ComponentPropsWithRef<"div"> {
  /** 그룹 ID */
  id: string;
  children: ReactNode;
}

export interface MenuItemGroupLabelProps extends ComponentPropsWithRef<"div"> {
  /** 대상 그룹 ID */
  htmlFor: string;
  children: ReactNode;
}

export type MenuSeparatorProps = ComponentPropsWithRef<"div">;
