/**
 * NumberInput 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { NumberInputState, NumberInputContext, NumberInputEvent } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  const decimals = (step.toString().split(".")[1] || "").length;
  return Number(snapped.toFixed(decimals));
}

function formatValue(value: number, step: number): string {
  const decimals = (step.toString().split(".")[1] || "").length;
  return value.toFixed(decimals);
}

function increment(ctx: NumberInputContext, amount: number = ctx.step): number {
  const next = ctx.value + amount;
  return clamp(snapToStep(next, ctx.min, ctx.step), ctx.min, ctx.max);
}

function decrement(ctx: NumberInputContext, amount: number = ctx.step): number {
  const next = ctx.value - amount;
  return clamp(snapToStep(next, ctx.min, ctx.step), ctx.min, ctx.max);
}

export function transition(
  state: NumberInputState,
  ctx: NumberInputContext,
  event: NumberInputEvent,
): TransitionResult<NumberInputState, NumberInputContext> {
  // disabled/readOnly일 때 제한
  if (ctx.disabled) {
    if (event.type === "SET_VALUE") {
      const val = clamp(event.value, ctx.min, ctx.max);
      return { state, context: { ...ctx, value: val, inputValue: formatValue(val, ctx.step) } };
    }
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  switch (event.type) {
    case "INCREMENT": {
      if (ctx.readOnly) return { state, context: ctx };
      const next = increment(ctx);
      return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
    }

    case "DECREMENT": {
      if (ctx.readOnly) return { state, context: ctx };
      const next = decrement(ctx);
      return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
    }

    case "INCREMENT_BY": {
      if (ctx.readOnly) return { state, context: ctx };
      const next = increment(ctx, event.amount);
      return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
    }

    case "DECREMENT_BY": {
      if (ctx.readOnly) return { state, context: ctx };
      const next = decrement(ctx, event.amount);
      return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
    }

    case "SET_TO_MIN": {
      if (ctx.readOnly) return { state, context: ctx };
      return {
        state,
        context: { ...ctx, value: ctx.min, inputValue: formatValue(ctx.min, ctx.step) },
      };
    }

    case "SET_TO_MAX": {
      if (ctx.readOnly) return { state, context: ctx };
      return {
        state,
        context: { ...ctx, value: ctx.max, inputValue: formatValue(ctx.max, ctx.step) },
      };
    }

    case "INPUT_CHANGE": {
      return {
        state: "focused",
        context: { ...ctx, inputValue: event.inputValue },
      };
    }

    case "INPUT_FOCUS": {
      return {
        state: "focused",
        context: ctx,
      };
    }

    case "INPUT_BLUR": {
      // blur 시 inputValue를 파싱하여 값 확정
      const parsed = parseFloat(ctx.inputValue);
      if (isNaN(parsed)) {
        // 유효하지 않으면 이전 값으로 복원
        return {
          state: "idle",
          context: { ...ctx, inputValue: formatValue(ctx.value, ctx.step) },
        };
      }
      const clamped = clamp(snapToStep(parsed, ctx.min, ctx.step), ctx.min, ctx.max);
      return {
        state: "idle",
        context: { ...ctx, value: clamped, inputValue: formatValue(clamped, ctx.step) },
      };
    }

    case "SPIN_START": {
      if (ctx.readOnly) return { state, context: ctx };
      const next = event.direction === "increment" ? increment(ctx) : decrement(ctx);
      return {
        state: "spinning",
        context: {
          ...ctx,
          value: next,
          inputValue: formatValue(next, ctx.step),
          spinDirection: event.direction,
        },
      };
    }

    case "SPIN_STOP": {
      return {
        state: "idle",
        context: { ...ctx, spinDirection: null },
      };
    }

    case "KEY_DOWN": {
      if (ctx.readOnly) return { state, context: ctx };

      if (isKey(event.key, Keys.ArrowUp)) {
        const next = increment(ctx);
        return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
      }

      if (isKey(event.key, Keys.ArrowDown)) {
        const next = decrement(ctx);
        return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
      }

      if (isKey(event.key, Keys.PageUp)) {
        const next = increment(ctx, ctx.step * 10);
        return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
      }

      if (isKey(event.key, Keys.PageDown)) {
        const next = decrement(ctx, ctx.step * 10);
        return { state, context: { ...ctx, value: next, inputValue: formatValue(next, ctx.step) } };
      }

      if (isKey(event.key, Keys.Home)) {
        return {
          state,
          context: { ...ctx, value: ctx.min, inputValue: formatValue(ctx.min, ctx.step) },
        };
      }

      if (isKey(event.key, Keys.End)) {
        return {
          state,
          context: { ...ctx, value: ctx.max, inputValue: formatValue(ctx.max, ctx.step) },
        };
      }

      return { state, context: ctx };
    }

    case "SET_VALUE": {
      const val = clamp(event.value, ctx.min, ctx.max);
      return { state, context: { ...ctx, value: val, inputValue: formatValue(val, ctx.step) } };
    }

    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createNumberInputMachine(ctx: Partial<NumberInputContext> & { id: string }) {
  const step = ctx.step ?? 1;
  const min = ctx.min ?? -Infinity;
  const max = ctx.max ?? Infinity;
  const value = clamp(ctx.value ?? 0, min, max);

  const initialContext: NumberInputContext = {
    value,
    min,
    max,
    step,
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
    required: ctx.required ?? false,
    name: ctx.name,
    inputValue: formatValue(value, step),
    spinDirection: null,
    id: ctx.id,
  };

  return {
    initialState: "idle" as NumberInputState,
    initialContext,
    transition,
  };
}
