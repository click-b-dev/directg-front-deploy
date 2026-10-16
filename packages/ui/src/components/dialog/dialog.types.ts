/**
 * Dialog 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface DialogRootProps {
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

export interface DialogTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export type DialogBackdropProps = ComponentPropsWithRef<"div">;

export interface DialogPositionerProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface DialogContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface DialogTitleProps extends ComponentPropsWithRef<"h2"> {
  children: ReactNode;
}

export interface DialogDescriptionProps extends ComponentPropsWithRef<"p"> {
  children: ReactNode;
}

export interface DialogCloseTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}
