/**
 * Slider 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { SliderState, SliderContext, SliderEvent } from "./types";

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  // 부동소수점 보정
  const decimals = (step.toString().split(".")[1] || "").length;
  return Number(snapped.toFixed(decimals));
}

function getThumbMin(ctx: SliderContext, index: number): number {
  return index === 0 ? ctx.min : ctx.value[index - 1]!;
}

function getThumbMax(ctx: SliderContext, index: number): number {
  return index === ctx.value.length - 1 ? ctx.max : ctx.value[index + 1]!;
}

function updateThumbValue(ctx: SliderContext, index: number, rawValue: number): number[] {
  const thumbMin = getThumbMin(ctx, index);
  const thumbMax = getThumbMax(ctx, index);
  const clamped = clampValue(rawValue, thumbMin, thumbMax);
  const snapped = snapToStep(clamped, ctx.min, ctx.step);
  const finalValue = clampValue(snapped, thumbMin, thumbMax);

  const nextValues = [...ctx.value];
  nextValues[index] = finalValue;
  return nextValues;
}

function getThumbId(ctx: SliderContext, index: number): string {
  return `${ctx.id}:thumb:${index}`;
}

export function transition(
  state: SliderState,
  ctx: SliderContext,
  event: SliderEvent,
): TransitionResult<SliderState, SliderContext> {
  if (ctx.disabled || ctx.readOnly) {
    // disabled/readOnly일 때는 SET_VALUE, SET_CONTEXT만 허용
    if (event.type === "SET_VALUE") {
      return { state, context: { ...ctx, value: event.value } };
    }
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  switch (event.type) {
    case "THUMB_POINTER_DOWN": {
      return {
        state: "dragging",
        context: { ...ctx, activeThumbIndex: event.index },
        effects: [{ type: "focus", target: getThumbId(ctx, event.index) }],
      };
    }

    case "POINTER_MOVE": {
      if (state !== "dragging" || ctx.activeThumbIndex < 0) return { state, context: ctx };

      const index = ctx.activeThumbIndex;
      // position은 0-1 범위로 정규화된 값
      const rawValue = ctx.min + event.position * (ctx.max - ctx.min);
      const nextValues = updateThumbValue(ctx, index, rawValue);

      return {
        state: "dragging",
        context: { ...ctx, value: nextValues },
      };
    }

    case "POINTER_UP": {
      if (state !== "dragging") return { state, context: ctx };
      return {
        state: "idle",
        context: { ...ctx, activeThumbIndex: -1 },
      };
    }

    case "THUMB_KEY_DOWN": {
      const { index, key } = event;
      const currentValue = ctx.value[index];
      if (currentValue === undefined) return { state, context: ctx };

      let delta = 0;
      const largeStep = ctx.step * 10;

      if (ctx.orientation === "horizontal") {
        if (isKey(key, Keys.ArrowRight, Keys.ArrowUp)) delta = ctx.step;
        else if (isKey(key, Keys.ArrowLeft, Keys.ArrowDown)) delta = -ctx.step;
      } else {
        if (isKey(key, Keys.ArrowUp, Keys.ArrowRight)) delta = ctx.step;
        else if (isKey(key, Keys.ArrowDown, Keys.ArrowLeft)) delta = -ctx.step;
      }

      if (isKey(key, Keys.PageUp)) delta = largeStep;
      if (isKey(key, Keys.PageDown)) delta = -largeStep;

      if (isKey(key, Keys.Home)) {
        const nextValues = updateThumbValue(ctx, index, ctx.min);
        return { state, context: { ...ctx, value: nextValues } };
      }

      if (isKey(key, Keys.End)) {
        const nextValues = updateThumbValue(ctx, index, ctx.max);
        return { state, context: { ...ctx, value: nextValues } };
      }

      if (delta !== 0) {
        const nextValues = updateThumbValue(ctx, index, currentValue + delta);
        return { state, context: { ...ctx, value: nextValues } };
      }

      return { state, context: ctx };
    }

    case "SET_VALUE": {
      return { state, context: { ...ctx, value: event.value } };
    }

    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createSliderMachine(ctx: Partial<SliderContext> & { id: string }) {
  const initialContext: SliderContext = {
    value: ctx.value ?? [0],
    min: ctx.min ?? 0,
    max: ctx.max ?? 100,
    step: ctx.step ?? 1,
    orientation: ctx.orientation ?? "horizontal",
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
    activeThumbIndex: -1,
    id: ctx.id,
  };

  return {
    initialState: "idle" as SliderState,
    initialContext,
    transition,
  };
}
