import type { ComponentPropsWithRef, ReactNode } from "react";

export interface ProgressRootProps extends Omit<ComponentPropsWithRef<"div">, "defaultValue"> {
  /** 현재 값 (null = indeterminate) */
  value?: number | null;
  /** 기본 값 */
  defaultValue?: number | null;
  /** 값 변경 콜백 */
  onValueChange?: (value: number | null) => void;
  /** 최솟값 */
  min?: number;
  /** 최댓값 */
  max?: number;
  children?: ReactNode;
}

export interface ProgressLabelProps extends ComponentPropsWithRef<"label"> {
  children?: ReactNode;
}

export interface ProgressTrackProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export type ProgressRangeProps = ComponentPropsWithRef<"div">;

export interface ProgressValueTextProps extends ComponentPropsWithRef<"span"> {
  children?: ReactNode;
}

export interface ProgressViewProps extends ComponentPropsWithRef<"div"> {
  /** 뷰 타입 */
  view?: "linear" | "circular";
  children?: ReactNode;
}

export interface ProgressCircleProps extends ComponentPropsWithRef<"svg"> {
  children?: ReactNode;
}

export type ProgressCircleTrackProps = ComponentPropsWithRef<"circle">;

export type ProgressCircleRangeProps = ComponentPropsWithRef<"circle">;
