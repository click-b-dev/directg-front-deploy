/**
 * AlertDialog 컴포넌트 Props
 * Dialog와 동일하지만 role="alertdialog"이며 backdrop 클릭으로 닫히지 않는다.
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface AlertDialogRootProps {
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

export interface AlertDialogTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export type AlertDialogBackdropProps = ComponentPropsWithRef<"div">;

export interface AlertDialogPositionerProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface AlertDialogContentProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface AlertDialogTitleProps extends ComponentPropsWithRef<"h2"> {
  children: ReactNode;
}

export interface AlertDialogDescriptionProps extends ComponentPropsWithRef<"p"> {
  children: ReactNode;
}

export interface AlertDialogCloseTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}
