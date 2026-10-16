/**
 * Select 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey, isPrintableKey } from "@/machines/shared";
import type { TransitionResult, Effect } from "@/machines/shared";
import type { SelectState, SelectContext, SelectEvent } from "./types";

function getEnabledIndices(ctx: SelectContext): number[] {
  return ctx.items.map((item, i) => (!item.disabled ? i : -1)).filter((i) => i !== -1);
}

function getOptionId(ctx: SelectContext, index: number): string {
  return `${ctx.id}:option:${index}`;
}

function getContentId(ctx: SelectContext): string {
  return `${ctx.id}:content`;
}

function getTriggerId(ctx: SelectContext): string {
  return `${ctx.id}:trigger`;
}

function getLabelForValue(ctx: SelectContext, value: string): string {
  const item = ctx.items.find((i) => i.value === value);
  return item?.label ?? "";
}

function findNextEnabledIndex(ctx: SelectContext, from: number, direction: 1 | -1): number {
  const enabledIndices = getEnabledIndices(ctx);
  if (enabledIndices.length === 0) return -1;

  if (direction === 1) {
    const next = enabledIndices.find((i) => i > from);
    return next ?? enabledIndices[enabledIndices.length - 1]!;
  } else {
    const reversed = [...enabledIndices].reverse();
    const prev = reversed.find((i) => i < from);
    return prev ?? enabledIndices[0]!;
  }
}

function findFirstEnabledIndex(ctx: SelectContext): number {
  const idx = ctx.items.findIndex((item) => !item.disabled);
  return idx === -1 ? 0 : idx;
}

function findLastEnabledIndex(ctx: SelectContext): number {
  for (let i = ctx.items.length - 1; i >= 0; i--) {
    if (!ctx.items[i]!.disabled) return i;
  }
  return 0;
}

function findTypeaheadIndex(ctx: SelectContext, buffer: string): number {
  const search = buffer.toLowerCase();
  const startIdx = ctx.highlightedIndex >= 0 ? ctx.highlightedIndex + 1 : 0;

  // 현재 인덱스 이후부터 검색
  for (let i = 0; i < ctx.items.length; i++) {
    const idx = (startIdx + i) % ctx.items.length;
    const item = ctx.items[idx]!;
    if (!item.disabled && item.label.toLowerCase().startsWith(search)) {
      return idx;
    }
  }
  return ctx.highlightedIndex;
}

function highlightEffects(ctx: SelectContext, index: number): Effect[] {
  return [{ type: "scrollIntoView", target: getOptionId(ctx, index) }];
}

function getSelectedIndex(ctx: SelectContext): number {
  return ctx.items.findIndex((item) => item.value === ctx.value);
}

export function transition(
  state: SelectState,
  ctx: SelectContext,
  event: SelectEvent,
): TransitionResult<SelectState, SelectContext> {
  switch (state) {
    case "closed":
      return closedTransition(ctx, event);
    case "open":
      return openTransition(ctx, event);
    default:
      return { state, context: ctx };
  }
}

function closedTransition(
  ctx: SelectContext,
  event: SelectEvent,
): TransitionResult<SelectState, SelectContext> {
  switch (event.type) {
    case "TRIGGER_CLICK": {
      const highlightedIndex =
        getSelectedIndex(ctx) >= 0 ? getSelectedIndex(ctx) : findFirstEnabledIndex(ctx);
      return {
        state: "open",
        context: { ...ctx, highlightedIndex },
        effects: [
          { type: "focus", target: getContentId(ctx) },
          ...highlightEffects(ctx, highlightedIndex),
        ],
      };
    }

    case "TRIGGER_KEY_DOWN": {
      if (isKey(event.key, Keys.Enter, Keys.Space, Keys.ArrowDown)) {
        const highlightedIndex =
          getSelectedIndex(ctx) >= 0 ? getSelectedIndex(ctx) : findFirstEnabledIndex(ctx);
        return {
          state: "open",
          context: { ...ctx, highlightedIndex },
          effects: [
            { type: "focus", target: getContentId(ctx) },
            ...highlightEffects(ctx, highlightedIndex),
          ],
        };
      }

      if (isKey(event.key, Keys.ArrowUp)) {
        const highlightedIndex =
          getSelectedIndex(ctx) >= 0 ? getSelectedIndex(ctx) : findLastEnabledIndex(ctx);
        return {
          state: "open",
          context: { ...ctx, highlightedIndex },
          effects: [
            { type: "focus", target: getContentId(ctx) },
            ...highlightEffects(ctx, highlightedIndex),
          ],
        };
      }

      // Type-ahead while closed: select matching item
      if (isPrintableKey(event.key)) {
        const buffer = ctx.typeaheadBuffer + event.key;
        const matchIdx = findTypeaheadIndex({ ...ctx, typeaheadBuffer: buffer }, buffer);
        if (matchIdx >= 0 && ctx.items[matchIdx]) {
          const item = ctx.items[matchIdx]!;
          return {
            state: "closed",
            context: {
              ...ctx,
              value: item.value,
              valueLabel: item.label,
              typeaheadBuffer: buffer,
            },
          };
        }
        return {
          state: "closed",
          context: { ...ctx, typeaheadBuffer: buffer },
        };
      }

      return { state: "closed", context: ctx };
    }

    case "SET_VALUE": {
      if (ctx.value === event.value) return { state: "closed", context: ctx };
      return {
        state: "closed",
        context: {
          ...ctx,
          value: event.value,
          valueLabel: getLabelForValue(ctx, event.value),
        },
      };
    }

    case "SET_ITEMS": {
      const valueLabel = event.items.find((i) => i.value === ctx.value)?.label ?? ctx.valueLabel;
      return {
        state: "closed",
        context: { ...ctx, items: event.items, valueLabel },
      };
    }

    case "CLEAR_TYPEAHEAD": {
      return { state: "closed", context: { ...ctx, typeaheadBuffer: "" } };
    }

    default:
      return { state: "closed", context: ctx };
  }
}

function openTransition(
  ctx: SelectContext,
  event: SelectEvent,
): TransitionResult<SelectState, SelectContext> {
  switch (event.type) {
    case "TRIGGER_CLICK": {
      return {
        state: "closed",
        context: { ...ctx, highlightedIndex: -1 },
        effects: [{ type: "focus", target: getTriggerId(ctx) }],
      };
    }

    case "OPTION_CLICK": {
      const item = ctx.items.find((i) => i.value === event.value);
      if (!item || item.disabled) return { state: "open", context: ctx };
      return {
        state: "closed",
        context: {
          ...ctx,
          value: item.value,
          valueLabel: item.label,
          highlightedIndex: -1,
        },
        effects: [{ type: "focus", target: getTriggerId(ctx) }],
      };
    }

    case "OPTION_HOVER": {
      const item = ctx.items[event.index];
      if (!item || item.disabled) return { state: "open", context: ctx };
      return {
        state: "open",
        context: { ...ctx, highlightedIndex: event.index },
      };
    }

    case "CONTENT_KEY_DOWN": {
      if (isKey(event.key, Keys.Escape)) {
        return {
          state: "closed",
          context: { ...ctx, highlightedIndex: -1 },
          effects: [{ type: "focus", target: getTriggerId(ctx) }],
        };
      }

      if (isKey(event.key, Keys.ArrowDown)) {
        const nextIdx =
          ctx.highlightedIndex < 0
            ? findFirstEnabledIndex(ctx)
            : findNextEnabledIndex(ctx, ctx.highlightedIndex, 1);
        return {
          state: "open",
          context: { ...ctx, highlightedIndex: nextIdx },
          effects: highlightEffects(ctx, nextIdx),
        };
      }

      if (isKey(event.key, Keys.ArrowUp)) {
        const prevIdx =
          ctx.highlightedIndex < 0
            ? findLastEnabledIndex(ctx)
            : findNextEnabledIndex(ctx, ctx.highlightedIndex, -1);
        return {
          state: "open",
          context: { ...ctx, highlightedIndex: prevIdx },
          effects: highlightEffects(ctx, prevIdx),
        };
      }

      if (isKey(event.key, Keys.Home)) {
        const firstIdx = findFirstEnabledIndex(ctx);
        return {
          state: "open",
          context: { ...ctx, highlightedIndex: firstIdx },
          effects: highlightEffects(ctx, firstIdx),
        };
      }

      if (isKey(event.key, Keys.End)) {
        const lastIdx = findLastEnabledIndex(ctx);
        return {
          state: "open",
          context: { ...ctx, highlightedIndex: lastIdx },
          effects: highlightEffects(ctx, lastIdx),
        };
      }

      if (isKey(event.key, Keys.Enter, Keys.Space)) {
        const item = ctx.items[ctx.highlightedIndex];
        if (!item || item.disabled) return { state: "open", context: ctx };
        return {
          state: "closed",
          context: {
            ...ctx,
            value: item.value,
            valueLabel: item.label,
            highlightedIndex: -1,
          },
          effects: [{ type: "focus", target: getTriggerId(ctx) }],
        };
      }

      if (isKey(event.key, Keys.Tab)) {
        return {
          state: "closed",
          context: { ...ctx, highlightedIndex: -1 },
        };
      }

      // Type-ahead
      if (isPrintableKey(event.key)) {
        const buffer = ctx.typeaheadBuffer + event.key;
        const matchIdx = findTypeaheadIndex({ ...ctx, typeaheadBuffer: buffer }, buffer);
        if (matchIdx >= 0) {
          return {
            state: "open",
            context: { ...ctx, highlightedIndex: matchIdx, typeaheadBuffer: buffer },
            effects: highlightEffects(ctx, matchIdx),
          };
        }
        return {
          state: "open",
          context: { ...ctx, typeaheadBuffer: buffer },
        };
      }

      return { state: "open", context: ctx };
    }

    case "CLOSE": {
      return {
        state: "closed",
        context: { ...ctx, highlightedIndex: -1 },
        effects: [{ type: "focus", target: getTriggerId(ctx) }],
      };
    }

    case "SET_VALUE": {
      if (ctx.value === event.value) return { state: "open", context: ctx };
      return {
        state: "open",
        context: {
          ...ctx,
          value: event.value,
          valueLabel: getLabelForValue(ctx, event.value),
        },
      };
    }

    case "SET_ITEMS": {
      const valueLabel = event.items.find((i) => i.value === ctx.value)?.label ?? ctx.valueLabel;
      return {
        state: "open",
        context: { ...ctx, items: event.items, valueLabel },
      };
    }

    case "CLEAR_TYPEAHEAD": {
      return { state: "open", context: { ...ctx, typeaheadBuffer: "" } };
    }

    default:
      return { state: "open", context: ctx };
  }
}

export function createSelectMachine(ctx: Partial<SelectContext> & { id: string }) {
  const items = ctx.items ?? [];
  const value = ctx.value ?? "";
  const valueLabel = ctx.valueLabel ?? items.find((i) => i.value === value)?.label ?? "";

  const initialContext: SelectContext = {
    value,
    items,
    highlightedIndex: -1,
    id: ctx.id,
    typeaheadBuffer: "",
    valueLabel,
  };

  return {
    initialState: "closed" as SelectState,
    initialContext,
    transition,
  };
}
