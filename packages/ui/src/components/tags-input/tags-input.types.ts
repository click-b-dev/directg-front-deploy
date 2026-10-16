/**
 * TagsInput React 컴포넌트 타입 정의
 */

export interface TagsInputRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 태그 값 배열 (controlled) */
  value?: string[];
  /** 기본 값 (uncontrolled) */
  defaultValue?: string[];
  /** 값 변경 콜백 */
  onValueChange?: (value: string[]) => void;
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 최대 태그 개수 (0이면 무제한) */
  max?: number;
  /** 구분자 (default: ",") */
  delimiter?: string;
  /** 중복 허용 여부 */
  allowDuplicates?: boolean;
  /** placeholder */
  placeholder?: string;
  /** 폼 필드 이름 */
  name?: string;
  children?: React.ReactNode;
}

export interface TagsInputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface TagsInputControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export type TagsInputInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export interface TagsInputItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  value: string;
  children?: React.ReactNode;
}

export interface TagsInputItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  index: number;
  children?: React.ReactNode;
}

export interface TagsInputItemDeleteTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  index: number;
  children?: React.ReactNode;
}

export interface TagsInputItemPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  children?: React.ReactNode;
}

export interface TagsInputItemInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
}

export type TagsInputClearTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type TagsInputHiddenInputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** 내부 Context */
export interface TagsInputContextValue {
  value: string[];
  inputValue: string;
  isAtMax: boolean;
  isEditing: boolean;
  editedTagIndex: number;
  getControlProps: () => Record<string, unknown>;
  getLabelProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  getItemProps: (props: { index: number; value: string }) => Record<string, unknown>;
  getItemTextProps: (props: { index: number }) => Record<string, unknown>;
  getItemDeleteTriggerProps: (props: { index: number }) => Record<string, unknown>;
  getItemPreviewProps: (props: { index: number }) => Record<string, unknown>;
  getItemInputProps: (props: { index: number }) => Record<string, unknown>;
  getClearTriggerProps: () => Record<string, unknown>;
  getHiddenInputProps: () => Record<string, unknown>;
}
