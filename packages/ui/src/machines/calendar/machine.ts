import type { MachineDefinition } from "@/machines/shared/types";
import type { CalendarState, CalendarContext, CalendarEvent } from "./types";

// ────────────────── Date utility helpers ──────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function endOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  return d;
}

function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date < min) return new Date(min);
  if (max && date > max) return new Date(max);
  return date;
}

function toViewDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// ────────────────── Machine ──────────────────

export function createCalendarMachine(
  initialContext: Partial<CalendarContext> = {},
): MachineDefinition<CalendarState, CalendarContext, CalendarEvent> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const context: CalendarContext = {
    value: null,
    focusedDate: today,
    viewDate: toViewDate(initialContext.value ?? initialContext.focusedDate ?? today),
    disabled: false,
    locale: "en-US",
    ...initialContext,
  };

  return {
    initialState: "idle",
    initialContext: context,
    transition(state, ctx, event) {
      if (ctx.disabled && event.type !== "SET_CONTEXT") {
        return { state, context: ctx };
      }

      switch (event.type) {
        case "FOCUS":
          return { state: "focused", context: ctx };

        case "BLUR":
          return { state: "idle", context: ctx };

        case "SELECT_DATE": {
          const date = clampDate(event.date, ctx.min, ctx.max);
          return {
            state,
            context: {
              ...ctx,
              value: date,
              focusedDate: date,
              viewDate: toViewDate(date),
            },
          };
        }

        case "FOCUS_DATE": {
          const date = clampDate(event.date, ctx.min, ctx.max);
          return {
            state: "focused",
            context: {
              ...ctx,
              focusedDate: date,
              viewDate: toViewDate(date),
            },
          };
        }

        case "FOCUS_NEXT_DAY": {
          const next = clampDate(addDays(ctx.focusedDate, 1), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: next, viewDate: toViewDate(next) },
          };
        }

        case "FOCUS_PREV_DAY": {
          const prev = clampDate(addDays(ctx.focusedDate, -1), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: prev, viewDate: toViewDate(prev) },
          };
        }

        case "FOCUS_NEXT_WEEK": {
          const next = clampDate(addDays(ctx.focusedDate, 7), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: next, viewDate: toViewDate(next) },
          };
        }

        case "FOCUS_PREV_WEEK": {
          const prev = clampDate(addDays(ctx.focusedDate, -7), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: prev, viewDate: toViewDate(prev) },
          };
        }

        case "FOCUS_NEXT_MONTH": {
          const next = clampDate(addMonths(ctx.focusedDate, 1), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: next, viewDate: toViewDate(next) },
          };
        }

        case "FOCUS_PREV_MONTH": {
          const prev = clampDate(addMonths(ctx.focusedDate, -1), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: prev, viewDate: toViewDate(prev) },
          };
        }

        case "FOCUS_NEXT_YEAR": {
          const next = clampDate(addYears(ctx.focusedDate, 1), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: next, viewDate: toViewDate(next) },
          };
        }

        case "FOCUS_PREV_YEAR": {
          const prev = clampDate(addYears(ctx.focusedDate, -1), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: prev, viewDate: toViewDate(prev) },
          };
        }

        case "FOCUS_START_OF_WEEK": {
          const start = clampDate(startOfWeek(ctx.focusedDate), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: start, viewDate: toViewDate(start) },
          };
        }

        case "FOCUS_END_OF_WEEK": {
          const end = clampDate(endOfWeek(ctx.focusedDate), ctx.min, ctx.max);
          return {
            state: "focused",
            context: { ...ctx, focusedDate: end, viewDate: toViewDate(end) },
          };
        }

        case "SET_VIEW_DATE": {
          return {
            state,
            context: { ...ctx, viewDate: toViewDate(event.date) },
          };
        }

        case "SET_CONTEXT": {
          const nextCtx = { ...ctx, ...event.context };
          return { state, context: nextCtx };
        }

        default:
          return { state, context: ctx };
      }
    },
  };
}
