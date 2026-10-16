/**
 * Clipboard React 컴포넌트 타입 정의
 */

export interface ClipboardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 복사할 값 (controlled) */
  value: string;
  /** 복사 완료 상태 표시 시간 (ms) */
  timeout?: number;
  /** 복사 완료 콜백 */
  onCopied?: () => void;
  children?: React.ReactNode;
}

export interface ClipboardLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export type ClipboardControlProps = React.HTMLAttributes<HTMLDivElement>;

export type ClipboardInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface ClipboardTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface ClipboardIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** true면 복사된 상태에서 표시, false면 복사 전 상태에서 표시 */
  copied: boolean;
  children?: React.ReactNode;
}

/** 내부 Context */
export interface ClipboardContextValue {
  value: string;
  copied: boolean;
  getLabelProps: () => Record<string, unknown>;
  getControlProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  getTriggerProps: () => Record<string, unknown>;
  getIndicatorProps: (props: { copied: boolean }) => Record<string, unknown>;
}
