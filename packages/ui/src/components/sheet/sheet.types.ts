/**
 * Sheet 컴포넌트 Props
 * Dialog 머신을 재사용하는 슬라이드인 패널.
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export type SheetSide = "top" | "right" | "bottom" | "left";

export interface SheetRootProps {
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 제어 모드: 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 슬라이드인 방향 */
  side?: SheetSide;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface SheetTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export type SheetBackdropProps = ComponentPropsWithRef<"div">;

export interface SheetContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface SheetTitleProps extends ComponentPropsWithRef<"h2"> {
  children: ReactNode;
}

export interface SheetDescriptionProps extends ComponentPropsWithRef<"p"> {
  children: ReactNode;
}

export interface SheetCloseTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}
