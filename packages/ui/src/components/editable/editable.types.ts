/**
 * Editable React 컴포넌트 타입 정의
 */

export interface EditableRootProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** 현재 값 (controlled) */
  value?: string;
  /** 기본 값 (uncontrolled) */
  defaultValue?: string;
  /** 값 변경 콜백 */
  onValueChange?: (value: string) => void;
  /** 제출 콜백 */
  onSubmit?: (value: string) => void;
  /** 취소 콜백 */
  onCancel?: (previousValue: string) => void;
  /** 편집 모드 진입 콜백 */
  onEdit?: () => void;
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 플레이스홀더 */
  placeholder?: string;
  /** blur 시 자동 제출 */
  submitOnBlur?: boolean;
  /** Enter 시 제출 */
  submitOnEnter?: boolean;
  /** 최대 글자 수 (0이면 무제한) */
  maxLength?: number;
  children?: React.ReactNode;
}

export type EditableAreaProps = React.HTMLAttributes<HTMLDivElement>;

export interface EditableLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface EditablePreviewProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export type EditableInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface EditableEditTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface EditableSubmitTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface EditableCancelTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export type EditableControlProps = React.HTMLAttributes<HTMLDivElement>;

/** 내부 Context */
export interface EditableContextValue {
  value: string;
  isEditing: boolean;
  getAreaProps: () => Record<string, unknown>;
  getLabelProps: () => Record<string, unknown>;
  getPreviewProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  getEditTriggerProps: () => Record<string, unknown>;
  getSubmitTriggerProps: () => Record<string, unknown>;
  getCancelTriggerProps: () => Record<string, unknown>;
  getControlProps: () => Record<string, unknown>;
}
