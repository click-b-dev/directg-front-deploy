/**
 * NumberInput React 컴포넌트 타입 정의
 */

export interface NumberInputRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 현재 값 (controlled) */
  value?: number;
  /** 기본 값 (uncontrolled) */
  defaultValue?: number;
  /** 값 변경 콜백 */
  onValueChange?: (value: number) => void;
  /** 최솟값 */
  min?: number;
  /** 최댓값 */
  max?: number;
  /** 증감 단위 */
  step?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 필수 입력 */
  required?: boolean;
  /** 폼 필드 이름 */
  name?: string;
  children?: React.ReactNode;
}

export interface NumberInputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export type NumberInputInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface NumberInputIncrementTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface NumberInputDecrementTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export type NumberInputScrubberProps = React.HTMLAttributes<HTMLDivElement>;

export interface NumberInputValueTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/** 내부 Context */
export interface NumberInputContextValue {
  value: number;
  inputValue: string;
  getLabelProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  getIncrementTriggerProps: () => Record<string, unknown>;
  getDecrementTriggerProps: () => Record<string, unknown>;
  getScrubberProps: () => Record<string, unknown>;
  getValueTextProps: () => Record<string, unknown>;
}
