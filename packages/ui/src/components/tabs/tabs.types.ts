/**
 * Tabs React 컴포넌트 타입 정의
 */

import type { TabItem } from "@/machines/tabs";

export interface TabsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 활성 탭 값 (controlled) */
  value?: string;
  /** 기본 활성 탭 값 (uncontrolled) */
  defaultValue?: string;
  /** 값 변경 콜백 */
  onValueChange?: (value: string) => void;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 활성화 모드 */
  activationMode?: "automatic" | "manual";
  children?: React.ReactNode;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 탭 값 (필수) */
  value: string;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 탭 값 (필수) */
  value: string;
  children?: React.ReactNode;
}

export interface TabsIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/** 내부 Context에서 공유하는 값 */
export interface TabsContextValue {
  value: string;
  orientation: "horizontal" | "vertical";
  getTriggerProps: (props: { value: string; disabled?: boolean }) => Record<string, unknown>;
  getContentProps: (props: { value: string }) => Record<string, unknown>;
  getListProps: () => Record<string, unknown>;
  getIndicatorProps: () => Record<string, unknown>;
  registerItem: (item: TabItem) => void;
  unregisterItem: (value: string) => void;
}
