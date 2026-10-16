import type { ComponentPropsWithRef, ReactNode } from "react";
import type { CalendarDay } from "@/machines/calendar";

export interface DatePickerRootProps {
  /** 선택된 날짜 (controlled) */
  value?: Date | null;
  /** 기본 선택 날짜 */
  defaultValue?: Date | null;
  /** 값 변경 콜백 */
  onValueChange?: (date: Date | null) => void;
  /** 열림 상태 (controlled) */
  open?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 최소 선택 가능 날짜 */
  min?: Date;
  /** 최대 선택 가능 날짜 */
  max?: Date;
  /** 비활성화 */
  disabled?: boolean;
  /** 로케일 */
  locale?: string;
  /** 날짜 포맷 */
  format?: string;
  /** 컴포넌트 ID */
  id?: string;
  children?: ReactNode;
}

export interface DatePickerLabelProps extends ComponentPropsWithRef<"label"> {
  children?: ReactNode;
}

export interface DatePickerControlProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export type DatePickerInputProps = ComponentPropsWithRef<"input">;

export interface DatePickerTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface DatePickerClearTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface DatePickerContentProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface DatePickerPositionerProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface DatePickerViewControlProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface DatePickerPrevTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface DatePickerNextTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface DatePickerGridProps extends ComponentPropsWithRef<"table"> {
  children?: ReactNode;
}

export interface DatePickerGridHeaderProps extends ComponentPropsWithRef<"thead"> {
  children?: ReactNode;
}

export interface DatePickerGridHeaderCellProps extends ComponentPropsWithRef<"th"> {
  index: number;
  children?: ReactNode;
}

export interface DatePickerGridBodyProps extends ComponentPropsWithRef<"tbody"> {
  children?: ReactNode;
}

export interface DatePickerGridRowProps extends ComponentPropsWithRef<"tr"> {
  weekIndex: number;
  children?: ReactNode;
}

export interface DatePickerGridCellProps extends ComponentPropsWithRef<"td"> {
  day: CalendarDay;
  children?: ReactNode;
}

export interface DatePickerCellTriggerProps extends ComponentPropsWithRef<"button"> {
  day: CalendarDay;
  children?: ReactNode;
}

export type DatePickerMonthSelectProps = ComponentPropsWithRef<"select">;

export type DatePickerYearSelectProps = ComponentPropsWithRef<"select">;
