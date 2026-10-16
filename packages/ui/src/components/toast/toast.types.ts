/**
 * Toast React 컴포넌트 타입 정의
 */

import type {
  ToastContext,
  ToastPlacement,
  ToastData,
  ToastType,
  AddToastOptions,
} from "@/machines/toast";

export interface ToastGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 배치 위치 */
  placement?: ToastPlacement;
  /** 최대 동시 표시 개수 */
  max?: number;
  /** 기본 자동 닫힘 시간 (ms) */
  defaultDuration?: number;
  children?: React.ReactNode;
}

export interface ToastRootProps extends React.HTMLAttributes<HTMLLIElement> {
  toast: ToastContext;
  children?: React.ReactNode;
}

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface ToastActionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface ToastCloseTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

/** Toast 생성 옵션 */
export type CreateToastOptions = AddToastOptions;

/** Toaster API (외부에서 사용) */
export interface ToasterApi {
  /** 토스트 추가 */
  create(options: CreateToastOptions): void;
  /** 특정 토스트 닫기 */
  dismiss(id: string): void;
  /** 모든 토스트 닫기 */
  dismissAll(): void;
}

/** 내부 Toast Context */
export interface ToastContextValue {
  toast: ToastContext;
  getToastProps: () => Record<string, unknown>;
  getToastTitleProps: () => Record<string, unknown>;
  getToastDescriptionProps: () => Record<string, unknown>;
  getToastActionTriggerProps: () => Record<string, unknown>;
  getToastCloseTriggerProps: () => Record<string, unknown>;
}

/** 내부 Group Context */
export interface ToastGroupContextValue {
  toasts: ToastContext[];
  placement: ToastPlacement;
  api: ToasterApi;
}

export type { ToastContext, ToastPlacement, ToastData, ToastType };
