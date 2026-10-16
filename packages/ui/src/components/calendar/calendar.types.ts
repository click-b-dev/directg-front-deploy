import type { ComponentPropsWithRef, ReactNode } from "react";
import type { CalendarDay } from "@/machines/calendar";

export interface CalendarRootProps extends Omit<ComponentPropsWithRef<"div">, "defaultValue"> {
  /** 선택된 날짜 (controlled) */
  value?: Date | null;
  /** 기본 선택 날짜 */
  defaultValue?: Date | null;
  /** 값 변경 콜백 */
  onValueChange?: (date: Date | null) => void;
  /** 포커스된 날짜 변경 콜백 */
  onFocusedDateChange?: (date: Date) => void;
  /** 최소 선택 가능 날짜 */
  min?: Date;
  /** 최대 선택 가능 날짜 */
  max?: Date;
  /** 비활성화 */
  disabled?: boolean;
  /** 로케일 */
  locale?: string;
  children?: ReactNode;
}

export interface CalendarHeaderProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface CalendarHeadingProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface CalendarPrevTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface CalendarNextTriggerProps extends ComponentPropsWithRef<"button"> {
  children?: ReactNode;
}

export interface CalendarGridProps extends ComponentPropsWithRef<"table"> {
  children?: ReactNode;
}

export interface CalendarGridHeaderProps extends ComponentPropsWithRef<"thead"> {
  children?: ReactNode;
}

export interface CalendarGridHeaderCellProps extends ComponentPropsWithRef<"th"> {
  /** 요일 인덱스 (0=Sun) */
  index: number;
  children?: ReactNode;
}

export interface CalendarGridBodyProps extends ComponentPropsWithRef<"tbody"> {
  children?: ReactNode;
}

export interface CalendarGridRowProps extends ComponentPropsWithRef<"tr"> {
  /** 주 인덱스 */
  weekIndex: number;
  children?: ReactNode;
}

export interface CalendarGridCellProps extends ComponentPropsWithRef<"td"> {
  /** 날짜 데이터 */
  day: CalendarDay;
  children?: ReactNode;
}

export interface CalendarCellTriggerProps extends ComponentPropsWithRef<"button"> {
  /** 날짜 데이터 */
  day: CalendarDay;
  children?: ReactNode;
}
