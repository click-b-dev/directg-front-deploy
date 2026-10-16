/**
 * Slider React 컴포넌트 타입 정의
 */

export interface SliderRootProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> {
  /** 현재 값 (controlled) — 단일 thumb이면 number, 다중이면 number[] */
  value?: number[];
  /** 기본 값 (uncontrolled) */
  defaultValue?: number[];
  /** 값 변경 콜백 */
  onValueChange?: (value: number[]) => void;
  /** 최솟값 */
  min?: number;
  /** 최댓값 */
  max?: number;
  /** 증감 단위 */
  step?: number;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  children?: React.ReactNode;
}

export interface SliderLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

export interface SliderControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface SliderTrackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export type SliderRangeProps = React.HTMLAttributes<HTMLDivElement>;

export interface SliderThumbProps extends React.HTMLAttributes<HTMLDivElement> {
  /** thumb 인덱스 (multi-thumb 시) */
  index?: number;
  children?: React.ReactNode;
}

export interface SliderValueTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export interface SliderMarkerGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface SliderMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 마커 값 */
  value: number;
  children?: React.ReactNode;
}

/** 내부 Context */
export interface SliderContextValue {
  value: number[];
  getValuePercent: (index: number) => number;
  getLabelProps: () => Record<string, unknown>;
  getControlProps: () => Record<string, unknown>;
  getTrackProps: () => Record<string, unknown>;
  getRangeProps: () => Record<string, unknown>;
  getThumbProps: (props: { index: number }) => Record<string, unknown>;
  getValueTextProps: () => Record<string, unknown>;
  getMarkerGroupProps: () => Record<string, unknown>;
  getMarkerProps: (props: { value: number }) => Record<string, unknown>;
}
