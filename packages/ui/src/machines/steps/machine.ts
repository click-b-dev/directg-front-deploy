/**
 * Steps 상태머신
 * 순수 함수 — React 의존성 없음
 */

import type { TransitionResult } from "@/machines/shared";
import type { StepsState, StepsContext, StepsEvent } from "./types";

function clampStep(step: number, count: number): number {
  return Math.min(Math.max(0, step), count - 1);
}

export function transition(
  state: StepsState,
  ctx: StepsContext,
  event: StepsEvent,
): TransitionResult<StepsState, StepsContext> {
  switch (event.type) {
    case "SET_STEP": {
      const newStep = clampStep(event.step, ctx.count);
      if (newStep === ctx.step) return { state, context: ctx };
      return { state, context: { ...ctx, step: newStep } };
    }

    case "NEXT_STEP": {
      const newStep = clampStep(ctx.step + 1, ctx.count);
      return { state, context: { ...ctx, step: newStep } };
    }

    case "PREV_STEP": {
      const newStep = clampStep(ctx.step - 1, ctx.count);
      return { state, context: { ...ctx, step: newStep } };
    }

    case "TRIGGER_CLICK": {
      if (ctx.linear) {
        // linear 모드에서는 클릭으로 이동 불가 (이전 스텝만 가능)
        if (event.step > ctx.step) return { state, context: ctx };
      }
      const newStep = clampStep(event.step, ctx.count);
      return { state, context: { ...ctx, step: newStep } };
    }

    case "SET_COUNT": {
      const newStep = clampStep(ctx.step, event.count);
      return { state, context: { ...ctx, count: event.count, step: newStep } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createStepsMachine(ctx: Partial<StepsContext> & { id: string }) {
  const count = ctx.count ?? 1;

  const initialContext: StepsContext = {
    step: clampStep(ctx.step ?? 0, count),
    count,
    linear: ctx.linear ?? false,
    orientation: ctx.orientation ?? "horizontal",
    id: ctx.id,
  };

  return {
    initialState: "idle" as StepsState,
    initialContext,
    transition,
  };
}
