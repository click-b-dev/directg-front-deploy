/**
 * Collapsible 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface CollapsibleRootProps extends Omit<ComponentPropsWithRef<"div">, "defaultValue"> {
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 제어 모드: 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface CollapsibleTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface CollapsibleContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}
