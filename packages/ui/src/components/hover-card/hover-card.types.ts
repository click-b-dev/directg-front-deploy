/**
 * HoverCard 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface HoverCardRootProps {
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 제어 모드: 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 열기 지연 시간 (ms, 기본 700) */
  openDelay?: number;
  /** 닫기 지연 시간 (ms, 기본 300) */
  closeDelay?: number;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface HoverCardTriggerProps extends ComponentPropsWithRef<"a"> {
  children: ReactNode;
}

export interface HoverCardPositionerProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface HoverCardContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export type HoverCardArrowProps = ComponentPropsWithRef<"div">;
