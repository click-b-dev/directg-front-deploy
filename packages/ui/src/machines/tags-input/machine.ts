/**
 * TagsInput 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { TagsInputState, TagsInputContext, TagsInputEvent } from "./types";

function getInputId(ctx: TagsInputContext): string {
  return `${ctx.id}:input`;
}

function getItemInputId(ctx: TagsInputContext, index: number): string {
  return `${ctx.id}:item-input:${index}`;
}

function isAtMax(ctx: TagsInputContext): boolean {
  return ctx.max > 0 && ctx.value.length >= ctx.max;
}

function addTag(ctx: TagsInputContext, tag: string): { value: string[]; added: boolean } {
  const trimmed = tag.trim();
  if (!trimmed) return { value: ctx.value, added: false };
  if (!ctx.allowDuplicates && ctx.value.includes(trimmed)) {
    return { value: ctx.value, added: false };
  }
  if (isAtMax(ctx)) return { value: ctx.value, added: false };
  return { value: [...ctx.value, trimmed], added: true };
}

function splitByDelimiter(value: string, delimiter: string): string[] {
  return value
    .split(delimiter)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function transition(
  state: TagsInputState,
  ctx: TagsInputContext,
  event: TagsInputEvent,
): TransitionResult<TagsInputState, TagsInputContext> {
  if (ctx.disabled) {
    if (event.type === "SET_VALUE") {
      return { state, context: { ...ctx, value: event.value } };
    }
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  // editing 상태의 이벤트 처리
  if (state === "editing") {
    switch (event.type) {
      case "EDIT_TAG_CHANGE": {
        return {
          state: "editing",
          context: { ...ctx, editedTagValue: event.value },
        };
      }
      case "EDIT_TAG_COMMIT": {
        const trimmed = ctx.editedTagValue.trim();
        if (!trimmed) {
          // 빈 값이면 태그 삭제
          const nextValue = ctx.value.filter((_, i) => i !== ctx.editedTagIndex);
          return {
            state: "focused",
            context: {
              ...ctx,
              value: nextValue,
              editedTagIndex: -1,
              editedTagValue: "",
            },
            effects: [{ type: "focus", target: getInputId(ctx) }],
          };
        }
        // 중복 체크 (자기 자신 제외)
        if (
          !ctx.allowDuplicates &&
          ctx.value.some((v, i) => i !== ctx.editedTagIndex && v === trimmed)
        ) {
          return {
            state: "focused",
            context: {
              ...ctx,
              editedTagIndex: -1,
              editedTagValue: "",
            },
            effects: [{ type: "focus", target: getInputId(ctx) }],
          };
        }
        const nextValue = [...ctx.value];
        nextValue[ctx.editedTagIndex] = trimmed;
        return {
          state: "focused",
          context: {
            ...ctx,
            value: nextValue,
            editedTagIndex: -1,
            editedTagValue: "",
          },
          effects: [{ type: "focus", target: getInputId(ctx) }],
        };
      }
      case "EDIT_TAG_CANCEL": {
        return {
          state: "focused",
          context: {
            ...ctx,
            editedTagIndex: -1,
            editedTagValue: "",
          },
          effects: [{ type: "focus", target: getInputId(ctx) }],
        };
      }
      case "EDIT_TAG_KEY_DOWN": {
        if (isKey(event.key, Keys.Enter)) {
          return transition(state, ctx, { type: "EDIT_TAG_COMMIT" });
        }
        if (isKey(event.key, Keys.Escape)) {
          return transition(state, ctx, { type: "EDIT_TAG_CANCEL" });
        }
        return { state, context: ctx };
      }
      case "BLUR": {
        return transition(state, ctx, { type: "EDIT_TAG_COMMIT" });
      }
      default:
        return { state, context: ctx };
    }
  }

  switch (event.type) {
    case "FOCUS": {
      return {
        state: "focused",
        context: ctx,
      };
    }

    case "BLUR": {
      // 입력 값이 있으면 태그로 추가 시도
      if (ctx.inputValue.trim()) {
        const { value } = addTag(ctx, ctx.inputValue);
        return {
          state: "idle",
          context: { ...ctx, value, inputValue: "" },
        };
      }
      return {
        state: "idle",
        context: { ...ctx, inputValue: "" },
      };
    }

    case "INPUT_CHANGE": {
      return {
        state: "focused",
        context: { ...ctx, inputValue: event.value },
      };
    }

    case "ADD_TAG": {
      if (ctx.readOnly) return { state, context: ctx };
      const { value, added } = addTag(ctx, event.value);
      return {
        state,
        context: {
          ...ctx,
          value,
          inputValue: added ? "" : ctx.inputValue,
        },
      };
    }

    case "REMOVE_TAG": {
      if (ctx.readOnly) return { state, context: ctx };
      const nextValue = ctx.value.filter((_, i) => i !== event.index);
      return {
        state,
        context: { ...ctx, value: nextValue },
        effects: [{ type: "focus", target: getInputId(ctx) }],
      };
    }

    case "CLEAR_ALL": {
      if (ctx.readOnly) return { state, context: ctx };
      return {
        state,
        context: { ...ctx, value: [], inputValue: "" },
        effects: [{ type: "focus", target: getInputId(ctx) }],
      };
    }

    case "KEY_DOWN": {
      if (ctx.readOnly && !isKey(event.key, Keys.Tab)) {
        return { state, context: ctx };
      }

      // Enter 또는 구분자로 태그 추가
      if (isKey(event.key, Keys.Enter)) {
        if (!ctx.inputValue.trim()) return { state, context: ctx };
        const tags = splitByDelimiter(ctx.inputValue, ctx.delimiter);
        let nextValue = [...ctx.value];
        for (const tag of tags) {
          const result = addTag({ ...ctx, value: nextValue }, tag);
          nextValue = result.value;
        }
        return {
          state: "focused",
          context: { ...ctx, value: nextValue, inputValue: "" },
        };
      }

      // Backspace로 마지막 태그 삭제
      if (isKey(event.key, Keys.Backspace) && ctx.inputValue === "" && ctx.value.length > 0) {
        const nextValue = ctx.value.slice(0, -1);
        return {
          state: "focused",
          context: { ...ctx, value: nextValue },
        };
      }

      return { state, context: ctx };
    }

    case "PASTE": {
      if (ctx.readOnly) return { state, context: ctx };
      const tags = splitByDelimiter(event.value, ctx.delimiter);
      let nextValue = [...ctx.value];
      for (const tag of tags) {
        const result = addTag({ ...ctx, value: nextValue }, tag);
        nextValue = result.value;
      }
      return {
        state,
        context: { ...ctx, value: nextValue, inputValue: "" },
      };
    }

    case "TAG_CLICK": {
      if (ctx.readOnly || ctx.disabled) return { state, context: ctx };
      return {
        state: "editing",
        context: {
          ...ctx,
          editedTagIndex: event.index,
          editedTagValue: ctx.value[event.index] ?? "",
        },
        effects: [{ type: "focus", target: getItemInputId(ctx, event.index) }],
      };
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

export function createTagsInputMachine(ctx: Partial<TagsInputContext> & { id: string }) {
  const initialContext: TagsInputContext = {
    value: ctx.value ?? [],
    inputValue: ctx.inputValue ?? "",
    editedTagIndex: -1,
    editedTagValue: "",
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
    max: ctx.max ?? 0,
    delimiter: ctx.delimiter ?? ",",
    allowDuplicates: ctx.allowDuplicates ?? false,
    placeholder: ctx.placeholder ?? "",
    name: ctx.name,
    id: ctx.id,
  };

  return {
    initialState: "idle" as TagsInputState,
    initialContext,
    transition,
  };
}
