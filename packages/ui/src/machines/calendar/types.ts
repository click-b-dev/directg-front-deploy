export type CalendarState = "idle" | "focused";

export interface CalendarContext {
  /** 선택된 날짜 */
  value: Date | null;
  /** 포커스된 날짜 */
  focusedDate: Date;
  /** 보고 있는 월 (연도와 월 기준) */
  viewDate: Date;
  /** 최소 선택 가능 날짜 */
  min?: Date;
  /** 최대 선택 가능 날짜 */
  max?: Date;
  /** 비활성화 */
  disabled: boolean;
  /** 로케일 */
  locale: string;
}

export type CalendarEvent =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "SELECT_DATE"; date: Date }
  | { type: "FOCUS_DATE"; date: Date }
  | { type: "FOCUS_NEXT_DAY" }
  | { type: "FOCUS_PREV_DAY" }
  | { type: "FOCUS_NEXT_WEEK" }
  | { type: "FOCUS_PREV_WEEK" }
  | { type: "FOCUS_NEXT_MONTH" }
  | { type: "FOCUS_PREV_MONTH" }
  | { type: "FOCUS_NEXT_YEAR" }
  | { type: "FOCUS_PREV_YEAR" }
  | { type: "FOCUS_START_OF_WEEK" }
  | { type: "FOCUS_END_OF_WEEK" }
  | { type: "SET_VIEW_DATE"; date: Date }
  | { type: "SET_CONTEXT"; context: Partial<CalendarContext> };
