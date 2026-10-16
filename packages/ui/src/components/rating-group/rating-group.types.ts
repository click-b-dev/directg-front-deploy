/**
 * RatingGroup React 컴포넌트 타입 정의
 */

export interface RatingGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 현재 값 (controlled) */
  value?: number;
  /** 기본 값 (uncontrolled) */
  defaultValue?: number;
  /** 값 변경 콜백 */
  onValueChange?: (value: number) => void;
  /** 별 개수 */
  count?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 반값 허용 */
  allowHalf?: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 필수 입력 */
  required?: boolean;
  children?: React.ReactNode;
}

export interface RatingGroupLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface RatingGroupControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface RatingGroupItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 아이템 인덱스 (0-based) */
  index: number;
  children?: React.ReactNode;
}

export type RatingGroupHiddenInputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** 내부 Context */
export interface RatingGroupContextValue {
  value: number;
  hoveredValue: number;
  isHovering: boolean;
  count: number;
  getLabelProps: () => Record<string, unknown>;
  getControlProps: () => Record<string, unknown>;
  getItemProps: (props: { index: number }) => Record<string, unknown>;
  getHiddenInputProps: () => Record<string, unknown>;
}
