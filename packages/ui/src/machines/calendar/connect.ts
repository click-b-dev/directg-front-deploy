import type { Send } from "@/machines/shared/types";
import { dataAttr, composeEventHandlers } from "@/machines/shared";
import { Keys } from "@/machines/shared";
import type { CalendarState, CalendarContext, CalendarEvent } from "./types";

// ────────────────── Date helpers ──────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function isDateDisabled(date: Date, min?: Date, max?: Date): boolean {
  if (min && date < min) return true;
  if (max && date > max) return true;
  return false;
}

function getWeekdayNames(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const names: string[] = [];
  // 2024-01-07 is a Sunday
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, 7 + i);
    names.push(formatter.format(date));
  }
  return names;
}

function getMonthName(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isFocused: boolean;
}

function getCalendarGrid(ctx: CalendarContext): CalendarWeek[] {
  const year = ctx.viewDate.getFullYear();
  const month = ctx.viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0=Sun

  const weeks: CalendarWeek[] = [];
  let currentDate = new Date(year, month, 1 - startDay);

  for (let w = 0; w < 6; w++) {
    const days: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(currentDate);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: isToday(date),
        isSelected: ctx.value ? isSameDay(date, ctx.value) : false,
        isDisabled: isDateDisabled(date, ctx.min, ctx.max),
        isFocused: isSameDay(date, ctx.focusedDate),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push({ days });
    // Stop if we've passed the end of the month and filled out the week
    if (currentDate.getMonth() !== month && currentDate.getDay() === 0) break;
  }

  return weeks;
}

// ────────────────── Connect ──────────────────

export interface CalendarApi {
  /** 현재 상태 */
  state: CalendarState;
  /** 선택된 값 */
  value: Date | null;
  /** 포커스된 날짜 */
  focusedDate: Date;
  /** 보고 있는 월 */
  viewDate: Date;
  /** 달력 그리드 데이터 */
  weeks: CalendarWeek[];
  /** 요일 이름 */
  weekDays: string[];
  /** 현재 월 제목 */
  heading: string;

  /** 날짜 선택 */
  selectDate(date: Date): void;
  /** 이전 월 */
  prevMonth(): void;
  /** 다음 월 */
  nextMonth(): void;

  getRootProps(): Record<string, unknown>;
  getHeaderProps(): Record<string, unknown>;
  getHeadingProps(): Record<string, unknown>;
  getPrevTriggerProps(): Record<string, unknown>;
  getNextTriggerProps(): Record<string, unknown>;
  getGridProps(): Record<string, unknown>;
  getGridHeaderProps(): Record<string, unknown>;
  getGridHeaderCellProps(index: number): Record<string, unknown>;
  getGridBodyProps(): Record<string, unknown>;
  getGridRowProps(weekIndex: number): Record<string, unknown>;
  getGridCellProps(day: CalendarDay): Record<string, unknown>;
  getCellTriggerProps(day: CalendarDay): Record<string, unknown>;
}

export function connect(
  state: CalendarState,
  context: CalendarContext,
  send: Send<CalendarEvent>,
  ids: { root: string; grid: string },
): CalendarApi {
  const weeks = getCalendarGrid(context);
  const weekDays = getWeekdayNames(context.locale);
  const heading = getMonthName(context.viewDate, context.locale);

  return {
    state,
    value: context.value,
    focusedDate: context.focusedDate,
    viewDate: context.viewDate,
    weeks,
    weekDays,
    heading,

    selectDate(date: Date) {
      send({ type: "SELECT_DATE", date });
    },

    prevMonth() {
      send({ type: "FOCUS_PREV_MONTH" });
    },

    nextMonth() {
      send({ type: "FOCUS_NEXT_MONTH" });
    },

    getRootProps() {
      return {
        "data-scope": "calendar",
        "data-part": "root",
        "data-state": state,
        "data-disabled": dataAttr(context.disabled),
        id: ids.root,
      };
    },

    getHeaderProps() {
      return {
        "data-scope": "calendar",
        "data-part": "header",
      };
    },

    getHeadingProps() {
      return {
        "data-scope": "calendar",
        "data-part": "heading",
        "aria-live": "polite" as const,
      };
    },

    getPrevTriggerProps() {
      return {
        "data-scope": "calendar",
        "data-part": "prevTrigger",
        type: "button" as const,
        "aria-label": "Previous month",
        onClick: composeEventHandlers(() => {
          send({ type: "FOCUS_PREV_MONTH" });
        }),
      };
    },

    getNextTriggerProps() {
      return {
        "data-scope": "calendar",
        "data-part": "nextTrigger",
        type: "button" as const,
        "aria-label": "Next month",
        onClick: composeEventHandlers(() => {
          send({ type: "FOCUS_NEXT_MONTH" });
        }),
      };
    },

    getGridProps() {
      return {
        "data-scope": "calendar",
        "data-part": "grid",
        id: ids.grid,
        role: "grid",
        "aria-label": heading,
        tabIndex: 0,
        onKeyDown: composeEventHandlers((event: KeyboardEvent) => {
          switch (event.key) {
            case Keys.ArrowRight:
              event.preventDefault();
              send({ type: "FOCUS_NEXT_DAY" });
              break;
            case Keys.ArrowLeft:
              event.preventDefault();
              send({ type: "FOCUS_PREV_DAY" });
              break;
            case Keys.ArrowDown:
              event.preventDefault();
              send({ type: "FOCUS_NEXT_WEEK" });
              break;
            case Keys.ArrowUp:
              event.preventDefault();
              send({ type: "FOCUS_PREV_WEEK" });
              break;
            case Keys.PageDown:
              event.preventDefault();
              if (event.shiftKey) {
                send({ type: "FOCUS_NEXT_YEAR" });
              } else {
                send({ type: "FOCUS_NEXT_MONTH" });
              }
              break;
            case Keys.PageUp:
              event.preventDefault();
              if (event.shiftKey) {
                send({ type: "FOCUS_PREV_YEAR" });
              } else {
                send({ type: "FOCUS_PREV_MONTH" });
              }
              break;
            case Keys.Home:
              event.preventDefault();
              send({ type: "FOCUS_START_OF_WEEK" });
              break;
            case Keys.End:
              event.preventDefault();
              send({ type: "FOCUS_END_OF_WEEK" });
              break;
            case Keys.Enter:
            case Keys.Space:
              event.preventDefault();
              send({ type: "SELECT_DATE", date: context.focusedDate });
              break;
          }
        }),
        onFocus: composeEventHandlers(() => {
          send({ type: "FOCUS" });
        }),
        onBlur: composeEventHandlers(() => {
          send({ type: "BLUR" });
        }),
      };
    },

    getGridHeaderProps() {
      return {
        "data-scope": "calendar",
        "data-part": "gridHeader",
        role: "row",
      };
    },

    getGridHeaderCellProps(index: number) {
      return {
        "data-scope": "calendar",
        "data-part": "gridHeaderCell",
        role: "columnheader",
        "aria-label": weekDays[index],
      };
    },

    getGridBodyProps() {
      return {
        "data-scope": "calendar",
        "data-part": "gridBody",
      };
    },

    getGridRowProps(weekIndex: number) {
      return {
        "data-scope": "calendar",
        "data-part": "gridRow",
        role: "row",
        "data-week": weekIndex,
      };
    },

    getGridCellProps(day: CalendarDay) {
      return {
        "data-scope": "calendar",
        "data-part": "gridCell",
        role: "gridcell",
        "aria-selected": day.isSelected ? "true" : undefined,
        "aria-disabled": day.isDisabled ? "true" : undefined,
      };
    },

    getCellTriggerProps(day: CalendarDay) {
      return {
        "data-scope": "calendar",
        "data-part": "cellTrigger",
        "data-state": day.isSelected ? "selected" : undefined,
        "data-today": day.isToday ? "" : undefined,
        "data-disabled": dataAttr(day.isDisabled),
        "data-outside-month": dataAttr(!day.isCurrentMonth),
        "data-focused": dataAttr(day.isFocused),
        "aria-current": day.isToday ? ("date" as const) : undefined,
        tabIndex: day.isFocused ? 0 : -1,
        onClick: composeEventHandlers(() => {
          if (!day.isDisabled) {
            send({ type: "SELECT_DATE", date: day.date });
          }
        }),
      };
    },
  };
}
