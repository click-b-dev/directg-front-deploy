/**
 * PinInput React 컴포넌트 타입 정의
 */

export interface PinInputRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 각 입력 필드의 값 배열 (controlled) */
  value?: string[];
  /** 기본 값 (uncontrolled) */
  defaultValue?: string[];
  /** 값 변경 콜백 */
  onValueChange?: (value: string[]) => void;
  /** 모든 필드가 채워졌을 때 콜백 */
  onComplete?: (value: string) => void;
  /** 입력 필드 개수 */
  length?: number;
  /** OTP 모드 */
  otp?: boolean;
  /** 값 마스킹 */
  mask?: boolean;
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 필수 입력 */
  required?: boolean;
  /** 허용 패턴 (정규식) */
  pattern?: string;
  /** placeholder 문자 */
  placeholder?: string;
  /** 폼 필드 이름 */
  name?: string;
  children?: React.ReactNode;
}

export interface PinInputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface PinInputControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface PinInputInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 입력 필드 인덱스 */
  index: number;
}

export type PinInputHiddenInputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** 내부 Context */
export interface PinInputContextValue {
  value: string[];
  isComplete: boolean;
  getLabelProps: () => Record<string, unknown>;
  getControlProps: () => Record<string, unknown>;
  getInputProps: (props: { index: number }) => Record<string, unknown>;
  getHiddenInputProps: () => Record<string, unknown>;
}
