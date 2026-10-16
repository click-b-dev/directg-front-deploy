/**
 * FloatingPanel 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Position, Size } from "@/machines/floating-panel/types";

export interface FloatingPanelRootProps {
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 제어 모드: 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 초기 위치 */
  position?: Position;
  /** 위치 변경 콜백 */
  onPositionChange?: (position: Position) => void;
  /** 초기 크기 */
  size?: Size;
  /** 크기 변경 콜백 */
  onSizeChange?: (size: Size) => void;
  /** 최소 크기 */
  minSize?: Size;
  /** 최대 크기 */
  maxSize?: Size;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface FloatingPanelTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface FloatingPanelPositionerProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface FloatingPanelContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface FloatingPanelHeaderProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface FloatingPanelTitleProps extends ComponentPropsWithRef<"h2"> {
  children: ReactNode;
}

export interface FloatingPanelBodyProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export type FloatingPanelDragTriggerProps = ComponentPropsWithRef<"div"> & {
  children?: ReactNode;
};

export interface FloatingPanelResizeTriggerProps extends ComponentPropsWithRef<"div"> {
  /** 리사이즈 방향: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" */
  direction: string;
}

export interface FloatingPanelCloseTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface FloatingPanelMinimizeTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface FloatingPanelMaximizeTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}
