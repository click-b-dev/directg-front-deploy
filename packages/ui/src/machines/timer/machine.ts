/**
 * Timer 상태머신
 * 순수 함수 — React 의존성 없음
 */

import type { TransitionResult } from "@/machines/shared";
import type { TimerState, TimerContext, TimerEvent, TimerSegments } from "./types";

/** ms를 세그먼트로 변환 */
export function msToSegments(ms: number): TimerSegments {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function transition(
  state: TimerState,
  ctx: TimerContext,
  event: TimerEvent,
): TransitionResult<TimerState, TimerContext> {
  switch (event.type) {
    case "START": {
      if (state === "running") return { state, context: ctx };
      return { state: "running", context: ctx };
    }

    case "PAUSE": {
      if (state !== "running") return { state, context: ctx };
      return { state: "paused", context: ctx };
    }

    case "RESUME": {
      if (state !== "paused") return { state, context: ctx };
      return { state: "running", context: ctx };
    }

    case "RESET": {
      const resetMs = ctx.countdown ? ctx.startMs : 0;
      return { state: "idle", context: { ...ctx, currentMs: resetMs } };
    }

    case "TICK": {
      if (state !== "running") return { state, context: ctx };

      if (ctx.countdown) {
        const next = ctx.currentMs - ctx.interval;
        if (next <= 0) {
          return { state: "idle", context: { ...ctx, currentMs: 0 } };
        }
        return { state: "running", context: { ...ctx, currentMs: next } };
      }

      const next = ctx.currentMs + ctx.interval;
      return { state: "running", context: { ...ctx, currentMs: next } };
    }

    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createTimerMachine(ctx: Partial<TimerContext> & { id: string }) {
  const countdown = ctx.countdown ?? false;
  const startMs = ctx.startMs ?? 0;

  const initialContext: TimerContext = {
    startMs,
    countdown,
    autoStart: ctx.autoStart ?? false,
    interval: ctx.interval ?? 1000,
    currentMs: countdown ? startMs : 0,
    id: ctx.id,
  };

  return {
    initialState: (ctx.autoStart ? "running" : "idle") as TimerState,
    initialContext,
    transition,
  };
}
