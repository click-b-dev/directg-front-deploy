/**
 * Drawer 컴포넌트 Props
 * Dialog 머신을 재사용하는 모바일 친화적 슬라이드업 패널.
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export type DrawerSide = "top" | "right" | "bottom" | "left";

export interface DrawerRootProps {
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 제어 모드: 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 슬라이드 방향 (기본 "bottom") */
  side?: DrawerSide;
  /** 스냅 포인트 (0~1 비율 값 배열, 예: [0.5, 1]) */
  snapPoints?: number[];
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface DrawerTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export type DrawerBackdropProps = ComponentPropsWithRef<"div">;

export interface DrawerContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export type DrawerHandleProps = ComponentPropsWithRef<"div">;

export interface DrawerTitleProps extends ComponentPropsWithRef<"h2"> {
  children: ReactNode;
}

export interface DrawerDescriptionProps extends ComponentPropsWithRef<"p"> {
  children: ReactNode;
}

export interface DrawerCloseTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}
