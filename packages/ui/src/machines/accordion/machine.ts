/**
 * Accordion 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey, getNextIndex } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { AccordionState, AccordionContext, AccordionEvent } from "./types";

function getEnabledItems(ctx: AccordionContext) {
  return ctx.items.filter((item) => !item.disabled);
}

function getEnabledIndex(ctx: AccordionContext, value: string): number {
  return getEnabledItems(ctx).findIndex((item) => item.value === value);
}

function getTriggerId(ctx: AccordionContext, value: string): string {
  return `${ctx.id}:trigger:${value}`;
}

function toggleValue(ctx: AccordionContext, value: string): string[] {
  const isExpanded = ctx.value.includes(value);

  if (ctx.multiple) {
    return isExpanded ? ctx.value.filter((v) => v !== value) : [...ctx.value, value];
  }

  // single 모드
  if (isExpanded) {
    return ctx.collapsible ? [] : ctx.value;
  }
  return [value];
}

export function transition(
  state: AccordionState,
  ctx: AccordionContext,
  event: AccordionEvent,
): TransitionResult<AccordionState, AccordionContext> {
  switch (event.type) {
    case "ITEM_TOGGLE": {
      const item = ctx.items.find((i) => i.value === event.value);
      if (item?.disabled) return { state, context: ctx };

      const nextValue = toggleValue(ctx, event.value);
      return {
        state,
        context: { ...ctx, value: nextValue },
      };
    }

    case "TRIGGER_FOCUS": {
      const idx = getEnabledIndex(ctx, event.value);
      if (idx === -1) return { state, context: ctx };
      return {
        state,
        context: { ...ctx, focusedIndex: idx },
      };
    }

    case "KEY_DOWN": {
      const enabledItems = getEnabledItems(ctx);
      const count = enabledItems.length;
      if (count === 0) return { state, context: ctx };

      if (isKey(event.key, Keys.ArrowUp, Keys.ArrowDown)) {
        const nextIdx = getNextIndex(event.key, ctx.focusedIndex, count, {
          orientation: "vertical",
          loop: true,
        });
        const nextItem = enabledItems[nextIdx];
        if (!nextItem) return { state, context: ctx };

        return {
          state,
          context: { ...ctx, focusedIndex: nextIdx },
          effects: [{ type: "focus", target: getTriggerId(ctx, nextItem.value) }],
        };
      }

      if (isKey(event.key, Keys.Home)) {
        const firstItem = enabledItems[0];
        if (!firstItem) return { state, context: ctx };
        return {
          state,
          context: { ...ctx, focusedIndex: 0 },
          effects: [{ type: "focus", target: getTriggerId(ctx, firstItem.value) }],
        };
      }

      if (isKey(event.key, Keys.End)) {
        const lastItem = enabledItems[count - 1];
        if (!lastItem) return { state, context: ctx };
        return {
          state,
          context: { ...ctx, focusedIndex: count - 1 },
          effects: [{ type: "focus", target: getTriggerId(ctx, lastItem.value) }],
        };
      }

      if (isKey(event.key, Keys.Enter, Keys.Space)) {
        const currentItem = enabledItems[ctx.focusedIndex];
        if (!currentItem) return { state, context: ctx };
        const nextValue = toggleValue(ctx, currentItem.value);
        return {
          state,
          context: { ...ctx, value: nextValue },
        };
      }

      return { state, context: ctx };
    }

    case "SET_VALUE": {
      const same =
        ctx.value.length === event.value.length && ctx.value.every((v, i) => v === event.value[i]);
      if (same) return { state, context: ctx };
      return { state, context: { ...ctx, value: event.value } };
    }

    case "SET_ITEMS": {
      return { state, context: { ...ctx, items: event.items } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createAccordionMachine(ctx: Partial<AccordionContext> & { id: string }) {
  const initialContext: AccordionContext = {
    value: ctx.value ?? [],
    items: ctx.items ?? [],
    multiple: ctx.multiple ?? false,
    collapsible: ctx.collapsible ?? false,
    focusedIndex: -1,
    id: ctx.id,
    orientation: ctx.orientation ?? "vertical",
  };

  return {
    initialState: "idle" as AccordionState,
    initialContext,
    transition,
  };
}
