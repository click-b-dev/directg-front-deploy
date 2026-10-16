/**
 * RatingGroup 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { RatingGroupState, RatingGroupContext, RatingGroupEvent } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getStepSize(ctx: RatingGroupContext): number {
  return ctx.allowHalf ? 0.5 : 1;
}

export function transition(
  state: RatingGroupState,
  ctx: RatingGroupContext,
  event: RatingGroupEvent,
): TransitionResult<RatingGroupState, RatingGroupContext> {
  if (ctx.disabled) {
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  switch (event.type) {
    case "SET_VALUE": {
      if (ctx.readOnly) return { state, context: ctx };
      const clamped = clamp(event.value, 0, ctx.count);
      return { state: "idle", context: { ...ctx, value: clamped, hoveredValue: -1 } };
    }

    case "HOVER": {
      if (ctx.readOnly) return { state, context: ctx };
      const clamped = clamp(event.value, 0, ctx.count);
      return { state: "hovering", context: { ...ctx, hoveredValue: clamped } };
    }

    case "HOVER_END": {
      return { state: "idle", context: { ...ctx, hoveredValue: -1 } };
    }

    case "KEY_DOWN": {
      if (ctx.readOnly) return { state, context: ctx };
      const stepSize = getStepSize(ctx);

      if (isKey(event.key, Keys.ArrowRight, Keys.ArrowUp)) {
        const next = clamp(ctx.value + stepSize, 0, ctx.count);
        return { state, context: { ...ctx, value: next } };
      }

      if (isKey(event.key, Keys.ArrowLeft, Keys.ArrowDown)) {
        const next = clamp(ctx.value - stepSize, 0, ctx.count);
        return { state, context: { ...ctx, value: next } };
      }

      if (isKey(event.key, Keys.Home)) {
        return { state, context: { ...ctx, value: 0 } };
      }

      if (isKey(event.key, Keys.End)) {
        return { state, context: { ...ctx, value: ctx.count } };
      }

      return { state, context: ctx };
    }

    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createRatingGroupMachine(ctx: Partial<RatingGroupContext> & { id: string }) {
  const initialContext: RatingGroupContext = {
    value: ctx.value ?? 0,
    count: ctx.count ?? 5,
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
    allowHalf: ctx.allowHalf ?? false,
    hoveredValue: -1,
    name: ctx.name,
    required: ctx.required ?? false,
    id: ctx.id,
  };

  return {
    initialState: "idle" as RatingGroupState,
    initialContext,
    transition,
  };
}
