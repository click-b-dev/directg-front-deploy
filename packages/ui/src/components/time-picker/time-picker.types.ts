import type { ComponentPropsWithRef, ReactNode } from "react";

export type TimeGranularity = "hour" | "minute" | "second";

export interface TimeValue {
  hour: number;
  minute: number;
  second: number;
}

export interface TimePickerRootProps {
  /** 현재 시간 값 (controlled) */
  value?: TimeValue | null;
  /** 기본 시간 값 */
  defaultValue?: TimeValue | null;
  /** 값 변경 콜백 */
  onValueChange?: (value: TimeValue | null) => void;
  /** 열림 상태 (controlled) */
  open?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 12시간 형식 */
  hour12?: boolean;
  /** 시간 단위 (hour | minute | second) */
  granularity?: TimeGranularity;
  /** 비활성화 */
  disabled?: boolean;
  /** 컴포넌트 ID */
  id?: string;
  children?: ReactNode;
}

export interface TimePickerLabelProps extends ComponentPropsWithRef<"label"> {
  children?: ReactNode;
}

export interface TimePickerControlProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export type TimePickerInputProps = ComponentPropsWithRef<"input">;

export interface TimePickerTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface TimePickerClearTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface TimePickerContentProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface TimePickerPositionerProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface TimePickerColumnProps extends ComponentPropsWithRef<"div"> {
  /** 컬럼 타입 */
  type: "hour" | "minute" | "second" | "period";
  children?: ReactNode;
}

export interface TimePickerCellProps extends Omit<
  ComponentPropsWithRef<"button">,
  "type" | "value"
> {
  /** 셀 값 */
  value: number | string;
  /** 컬럼 타입 */
  type: "hour" | "minute" | "second" | "period";
  children?: ReactNode;
}

export type TimePickerSpacerProps = ComponentPropsWithRef<"div">;
