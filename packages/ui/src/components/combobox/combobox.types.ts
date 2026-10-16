/**
 * Combobox React 컴포넌트 타입 정의
 */

import type { ComboboxItem } from "@/machines/combobox";

export interface ComboboxRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 선택된 값 (controlled) */
  value?: string[];
  /** 기본 선택 값 (uncontrolled) */
  defaultValue?: string[];
  /** 값 변경 콜백 */
  onValueChange?: (value: string[]) => void;
  /** 입력 텍스트 (controlled) */
  inputValue?: string;
  /** 입력 텍스트 변경 콜백 */
  onInputValueChange?: (value: string) => void;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 아이템 목록 */
  items?: ComboboxItem[];
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 다중 선택 */
  multiple?: boolean;
  /** 필터 함수 (기본: label에 inputValue 포함) */
  filter?: (item: ComboboxItem, inputValue: string) => boolean;
  /** 입력 시 자동으로 목록 열기 */
  openOnInput?: boolean;
  /** 폼 전송용 name */
  name?: string;
  children?: React.ReactNode;
}

export interface ComboboxLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface ComboboxControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export type ComboboxInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface ComboboxClearTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface ComboboxPositionerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface ComboboxContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface ComboboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 아이템 값 (필수) */
  value: string;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface ComboboxItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface ComboboxItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface ComboboxItemGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 그룹 ID */
  id: string;
  children?: React.ReactNode;
}

export interface ComboboxItemGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 대응하는 그룹 ID */
  htmlFor: string;
  children?: React.ReactNode;
}

/** 내부 Context */
export interface ComboboxContextValue {
  value: string[];
  inputValue: string;
  highlightedValue: string;
  open: boolean;
  multiple: boolean;
  getRootProps: () => Record<string, unknown>;
  getLabelProps: () => Record<string, unknown>;
  getControlProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  getTriggerProps: () => Record<string, unknown>;
  getClearTriggerProps: () => Record<string, unknown>;
  getPositionerProps: () => Record<string, unknown>;
  getContentProps: () => Record<string, unknown>;
  getItemProps: (props: { value: string; disabled?: boolean }) => Record<string, unknown>;
  getItemTextProps: () => Record<string, unknown>;
  getItemIndicatorProps: (props: { value: string }) => Record<string, unknown>;
  getItemGroupProps: (props: { id: string }) => Record<string, unknown>;
  getItemGroupLabelProps: (props: { htmlFor: string }) => Record<string, unknown>;
}
