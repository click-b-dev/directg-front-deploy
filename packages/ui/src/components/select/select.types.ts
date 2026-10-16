/**
 * Select React 컴포넌트 타입 정의
 */

import type { SelectItem } from "@/machines/select";

export interface SelectRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 선택된 값 (controlled) */
  value?: string;
  /** 기본 선택 값 (uncontrolled) */
  defaultValue?: string;
  /** 값 변경 콜백 */
  onValueChange?: (value: string) => void;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 아이템 목록 */
  items?: SelectItem[];
  /** 폼 전송용 name */
  name?: string;
  children?: React.ReactNode;
}

export interface SelectLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface SelectValueTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 값이 없을 때 표시할 텍스트 */
  placeholder?: string;
  children?: React.ReactNode;
}

export interface SelectPositionerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 아이템 값 (필수) */
  value: string;
  /** 아이템 레이블 (미지정 시 children 텍스트 사용) */
  label?: string;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface SelectItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface SelectItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface SelectHiddenSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
}

/** 내부 Context */
export interface SelectContextValue {
  value: string;
  valueLabel: string;
  open: boolean;
  highlightedIndex: number;
  getRootProps: () => Record<string, unknown>;
  getLabelProps: () => Record<string, unknown>;
  getTriggerProps: () => Record<string, unknown>;
  getPositionerProps: () => Record<string, unknown>;
  getContentProps: () => Record<string, unknown>;
  getItemProps: (props: {
    value: string;
    index: number;
    disabled?: boolean;
  }) => Record<string, unknown>;
  getItemTextProps: () => Record<string, unknown>;
  getItemIndicatorProps: (props: { value: string }) => Record<string, unknown>;
  getValueTextProps: () => Record<string, unknown>;
  getHiddenSelectProps: (props: { name?: string }) => Record<string, unknown>;
  registerItem: (item: SelectItem) => void;
  unregisterItem: (value: string) => void;
  name?: string;
  /** @internal 아이템 인덱스 조회 */
  _getItemIndex?: (value: string) => number;
}

/** Item 내부 Context */
export interface SelectItemContextValue {
  value: string;
  index: number;
  disabled: boolean;
}
