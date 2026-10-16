/**
 * Editable 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { EditableState, EditableContext, EditableEvent } from "./types";

function getInputId(ctx: EditableContext): string {
  return `${ctx.id}:input`;
}

export function transition(
  state: EditableState,
  ctx: EditableContext,
  event: EditableEvent,
): TransitionResult<EditableState, EditableContext> {
  if (ctx.disabled) {
    if (event.type === "SET_VALUE") {
      return { state, context: { ...ctx, value: event.value, previousValue: event.value } };
    }
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  switch (state) {
    case "preview": {
      switch (event.type) {
        case "EDIT": {
          if (ctx.readOnly) return { state, context: ctx };
          return {
            state: "editing",
            context: { ...ctx, previousValue: ctx.value },
            effects: [{ type: "focus", target: getInputId(ctx) }],
          };
        }
        case "SET_VALUE": {
          return { state, context: { ...ctx, value: event.value, previousValue: event.value } };
        }
        case "SET_CONTEXT": {
          return { state, context: { ...ctx, ...event.context } };
        }
        default:
          return { state, context: ctx };
      }
    }

    case "editing": {
      switch (event.type) {
        case "INPUT_CHANGE": {
          const value = ctx.maxLength > 0 ? event.value.slice(0, ctx.maxLength) : event.value;
          return {
            state: "editing",
            context: { ...ctx, value },
          };
        }
        case "SUBMIT": {
          return {
            state: "preview",
            context: { ...ctx, previousValue: ctx.value },
          };
        }
        case "CANCEL": {
          return {
            state: "preview",
            context: { ...ctx, value: ctx.previousValue },
          };
        }
        case "KEY_DOWN": {
          if (isKey(event.key, Keys.Enter) && ctx.submitOnEnter) {
            return transition(state, ctx, { type: "SUBMIT" });
          }
          if (isKey(event.key, Keys.Escape)) {
            return transition(state, ctx, { type: "CANCEL" });
          }
          return { state, context: ctx };
        }
        case "BLUR": {
          if (ctx.submitOnBlur) {
            return transition(state, ctx, { type: "SUBMIT" });
          }
          return transition(state, ctx, { type: "CANCEL" });
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

    default:
      return { state, context: ctx };
  }
}

export function createEditableMachine(ctx: Partial<EditableContext> & { id: string }) {
  const initialValue = ctx.value ?? "";

  const initialContext: EditableContext = {
    value: initialValue,
    previousValue: initialValue,
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
    placeholder: ctx.placeholder ?? "Click to edit",
    submitOnBlur: ctx.submitOnBlur ?? true,
    submitOnEnter: ctx.submitOnEnter ?? true,
    maxLength: ctx.maxLength ?? 0,
    id: ctx.id,
  };

  return {
    initialState: "preview" as EditableState,
    initialContext,
    transition,
  };
}
