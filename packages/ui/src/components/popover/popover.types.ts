/**
 * Popover 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface PopoverRootProps {
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 제어 모드: 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface PopoverTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface PopoverPositionerProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface PopoverContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface PopoverTitleProps extends ComponentPropsWithRef<"h3"> {
  children: ReactNode;
}

export interface PopoverDescriptionProps extends ComponentPropsWithRef<"p"> {
  children: ReactNode;
}

export interface PopoverCloseTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export type PopoverArrowProps = ComponentPropsWithRef<"div">;
