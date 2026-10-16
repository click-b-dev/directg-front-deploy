/**
 * PinInput 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult, Effect } from "@/machines/shared";
import type { PinInputState, PinInputContext, PinInputEvent } from "./types";

function getInputId(ctx: PinInputContext, index: number): string {
  return `${ctx.id}:input:${index}`;
}

function isValidChar(char: string, pattern: string): boolean {
  if (!char) return false;
  try {
    return new RegExp(pattern).test(char);
  } catch {
    return true;
  }
}

function isComplete(value: string[]): boolean {
  return value.every((v) => v.length > 0);
}

export function transition(
  state: PinInputState,
  ctx: PinInputContext,
  event: PinInputEvent,
): TransitionResult<PinInputState, PinInputContext> {
  if (ctx.disabled) {
    if (event.type === "SET_VALUE") {
      return { state, context: { ...ctx, value: event.value } };
    }
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    if (event.type === "CLEAR") {
      return { state, context: { ...ctx, value: Array(ctx.length).fill("") } };
    }
    return { state, context: ctx };
  }

  switch (event.type) {
    case "INPUT": {
      if (ctx.readOnly) return { state, context: ctx };

      const char = event.value.slice(-1); // 마지막 문자만 취함
      if (!isValidChar(char, ctx.pattern)) return { state, context: ctx };

      const nextValue = [...ctx.value];
      nextValue[event.index] = char;

      const effects: Effect[] = [];
      // 다음 입력으로 자동 이동
      const nextIndex = event.index + 1;
      if (nextIndex < ctx.length) {
        effects.push({ type: "focus", target: getInputId(ctx, nextIndex) });
      }

      return {
        state: "focused",
        context: {
          ...ctx,
          value: nextValue,
          focusedIndex: nextIndex < ctx.length ? nextIndex : event.index,
        },
        effects,
      };
    }

    case "PASTE": {
      if (ctx.readOnly) return { state, context: ctx };

      const chars = event.value.split("");
      const nextValue = [...ctx.value];
      let lastFilledIndex = event.index;

      for (let i = 0; i < chars.length && event.index + i < ctx.length; i++) {
        const char = chars[i]!;
        if (isValidChar(char, ctx.pattern)) {
          nextValue[event.index + i] = char;
          lastFilledIndex = event.index + i;
        }
      }

      const effects: Effect[] = [];
      const nextFocusIndex = Math.min(lastFilledIndex + 1, ctx.length - 1);
      effects.push({ type: "focus", target: getInputId(ctx, nextFocusIndex) });

      return {
        state: "focused",
        context: { ...ctx, value: nextValue, focusedIndex: nextFocusIndex },
        effects,
      };
    }

    case "BACKSPACE": {
      if (ctx.readOnly) return { state, context: ctx };

      const nextValue = [...ctx.value];
      const effects: Effect[] = [];

      if (nextValue[event.index]) {
        // 현재 칸에 값이 있으면 지우기
        nextValue[event.index] = "";
      } else if (event.index > 0) {
        // 현재 칸이 비어있으면 이전 칸으로 이동하고 지우기
        nextValue[event.index - 1] = "";
        effects.push({ type: "focus", target: getInputId(ctx, event.index - 1) });
      }

      return {
        state: "focused",
        context: {
          ...ctx,
          value: nextValue,
          focusedIndex:
            nextValue[event.index] === "" && event.index > 0 ? event.index - 1 : event.index,
        },
        effects,
      };
    }

    case "DELETE": {
      if (ctx.readOnly) return { state, context: ctx };

      const nextValue = [...ctx.value];
      nextValue[event.index] = "";

      return {
        state: "focused",
        context: { ...ctx, value: nextValue },
      };
    }

    case "FOCUS": {
      return {
        state: "focused",
        context: { ...ctx, focusedIndex: event.index },
      };
    }

    case "BLUR": {
      return {
        state: "idle",
        context: { ...ctx, focusedIndex: -1 },
      };
    }

    case "KEY_DOWN": {
      if (isKey(event.key, Keys.ArrowLeft)) {
        const prevIndex = Math.max(event.index - 1, 0);
        return {
          state: "focused",
          context: { ...ctx, focusedIndex: prevIndex },
          effects: [{ type: "focus", target: getInputId(ctx, prevIndex) }],
        };
      }

      if (isKey(event.key, Keys.ArrowRight)) {
        const nextIndex = Math.min(event.index + 1, ctx.length - 1);
        return {
          state: "focused",
          context: { ...ctx, focusedIndex: nextIndex },
          effects: [{ type: "focus", target: getInputId(ctx, nextIndex) }],
        };
      }

      if (isKey(event.key, Keys.Home)) {
        return {
          state: "focused",
          context: { ...ctx, focusedIndex: 0 },
          effects: [{ type: "focus", target: getInputId(ctx, 0) }],
        };
      }

      if (isKey(event.key, Keys.End)) {
        const lastIndex = ctx.length - 1;
        return {
          state: "focused",
          context: { ...ctx, focusedIndex: lastIndex },
          effects: [{ type: "focus", target: getInputId(ctx, lastIndex) }],
        };
      }

      return { state, context: ctx };
    }

    case "SET_VALUE": {
      const padded = [...event.value];
      while (padded.length < ctx.length) padded.push("");
      return { state, context: { ...ctx, value: padded.slice(0, ctx.length) } };
    }

    case "CLEAR": {
      return { state, context: { ...ctx, value: Array(ctx.length).fill("") } };
    }

    case "SET_CONTEXT": {
      const nextCtx = { ...ctx, ...event.context };
      // length가 바뀌면 value 배열도 조정
      if (event.context.length && event.context.length !== ctx.length) {
        const newValue = Array(event.context.length).fill("") as string[];
        for (let i = 0; i < Math.min(ctx.value.length, event.context.length); i++) {
          newValue[i] = ctx.value[i]!;
        }
        nextCtx.value = newValue;
      }
      return { state, context: nextCtx };
    }

    default:
      return { state, context: ctx };
  }
}

/** 완료 여부 확인 헬퍼 */
export { isComplete };

export function createPinInputMachine(ctx: Partial<PinInputContext> & { id: string }) {
  const length = ctx.length ?? 4;
  const defaultValue = ctx.value ?? Array(length).fill("");

  const initialContext: PinInputContext = {
    value: defaultValue,
    length,
    otp: ctx.otp ?? false,
    mask: ctx.mask ?? false,
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
    focusedIndex: -1,
    pattern: ctx.pattern ?? "[0-9]",
    placeholder: ctx.placeholder ?? "○",
    name: ctx.name,
    required: ctx.required ?? false,
    id: ctx.id,
  };

  return {
    initialState: "idle" as PinInputState,
    initialContext,
    transition,
  };
}
