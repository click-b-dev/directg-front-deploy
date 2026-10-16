/**
 * Tour 상태머신
 * 순수 함수 — React 의존성 없음
 */

import type { TransitionResult } from "@/machines/shared";
import type { TourState, TourContext, TourEvent } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function transition(
  state: TourState,
  ctx: TourContext,
  event: TourEvent,
): TransitionResult<TourState, TourContext> {
  switch (event.type) {
    case "OPEN": {
      if (state === "open") return { state, context: ctx };
      if (ctx.steps.length === 0) return { state, context: ctx };
      return { state: "open", context: { ...ctx, currentStep: 0 } };
    }

    case "CLOSE": {
      if (state === "closed") return { state, context: ctx };
      return { state: "closed", context: ctx };
    }

    case "NEXT": {
      if (state !== "open") return { state, context: ctx };
      const nextStep = ctx.currentStep + 1;
      if (nextStep >= ctx.steps.length) {
        return { state: "closed", context: ctx };
      }
      return { state: "open", context: { ...ctx, currentStep: nextStep } };
    }

    case "PREV": {
      if (state !== "open") return { state, context: ctx };
      const prevStep = clamp(ctx.currentStep - 1, 0, ctx.steps.length - 1);
      return { state: "open", context: { ...ctx, currentStep: prevStep } };
    }

    case "GO_TO": {
      if (state !== "open") return { state, context: ctx };
      const step = clamp(event.step, 0, ctx.steps.length - 1);
      return { state: "open", context: { ...ctx, currentStep: step } };
    }

    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createTourMachine(ctx: Partial<TourContext> & { id: string }) {
  const initialContext: TourContext = {
    steps: ctx.steps ?? [],
    currentStep: ctx.currentStep ?? 0,
    id: ctx.id,
  };

  return {
    initialState: "closed" as TourState,
    initialContext,
    transition,
  };
}
