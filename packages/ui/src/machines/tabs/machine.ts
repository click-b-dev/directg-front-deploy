/**
 * Tabs 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey, getNextIndex } from "@/machines/shared";
import type { TransitionResult, Effect } from "@/machines/shared";
import type { TabsState, TabsContext, TabsEvent } from "./types";

function getEnabledItems(ctx: TabsContext) {
  return ctx.items.filter((item) => !item.disabled);
}

function getItemIndex(ctx: TabsContext, value: string): number {
  return getEnabledItems(ctx).findIndex((item) => item.value === value);
}

function getTriggerId(ctx: TabsContext, value: string): string {
  return `${ctx.id}:trigger:${value}`;
}

export function transition(
  state: TabsState,
  ctx: TabsContext,
  event: TabsEvent,
): TransitionResult<TabsState, TabsContext> {
  switch (event.type) {
    case "TAB_CLICK": {
      const item = ctx.items.find((i) => i.value === event.value);
      if (item?.disabled) return { state, context: ctx };
      return {
        state,
        context: { ...ctx, value: event.value, focusedIndex: getItemIndex(ctx, event.value) },
      };
    }

    case "TAB_FOCUS": {
      const idx = getItemIndex(ctx, event.value);
      if (idx === -1) return { state, context: ctx };

      if (ctx.activationMode === "automatic") {
        return {
          state,
          context: { ...ctx, value: event.value, focusedIndex: idx },
        };
      }
      return {
        state,
        context: { ...ctx, focusedIndex: idx },
      };
    }

    case "KEY_DOWN": {
      const enabledItems = getEnabledItems(ctx);
      const count = enabledItems.length;
      if (count === 0) return { state, context: ctx };

      if (isKey(event.key, Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight)) {
        const nextIdx = getNextIndex(event.key, ctx.focusedIndex, count, {
          orientation: ctx.orientation,
          loop: true,
        });
        const nextItem = enabledItems[nextIdx];
        if (!nextItem) return { state, context: ctx };

        const effects: Effect[] = [{ type: "focus", target: getTriggerId(ctx, nextItem.value) }];

        if (ctx.activationMode === "automatic") {
          return {
            state,
            context: { ...ctx, value: nextItem.value, focusedIndex: nextIdx },
            effects,
          };
        }
        return {
          state,
          context: { ...ctx, focusedIndex: nextIdx },
          effects,
        };
      }

      if (isKey(event.key, Keys.Home)) {
        const firstItem = enabledItems[0];
        if (!firstItem) return { state, context: ctx };
        const effects: Effect[] = [{ type: "focus", target: getTriggerId(ctx, firstItem.value) }];

        if (ctx.activationMode === "automatic") {
          return {
            state,
            context: { ...ctx, value: firstItem.value, focusedIndex: 0 },
            effects,
          };
        }
        return { state, context: { ...ctx, focusedIndex: 0 }, effects };
      }

      if (isKey(event.key, Keys.End)) {
        const lastItem = enabledItems[count - 1];
        if (!lastItem) return { state, context: ctx };
        const effects: Effect[] = [{ type: "focus", target: getTriggerId(ctx, lastItem.value) }];

        if (ctx.activationMode === "automatic") {
          return {
            state,
            context: { ...ctx, value: lastItem.value, focusedIndex: count - 1 },
            effects,
          };
        }
        return { state, context: { ...ctx, focusedIndex: count - 1 }, effects };
      }

      if (isKey(event.key, Keys.Enter, Keys.Space)) {
        const currentItem = enabledItems[ctx.focusedIndex];
        if (!currentItem) return { state, context: ctx };
        return {
          state,
          context: { ...ctx, value: currentItem.value },
        };
      }

      return { state, context: ctx };
    }

    case "SET_VALUE": {
      if (ctx.value === event.value) return { state, context: ctx };
      return { state, context: { ...ctx, value: event.value } };
    }

    case "SET_ITEMS": {
      return { state, context: { ...ctx, items: event.items } };
    }

    case "SET_ORIENTATION": {
      return { state, context: { ...ctx, orientation: event.orientation } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createTabsMachine(ctx: Partial<TabsContext> & { id: string }) {
  const initialContext: TabsContext = {
    value: ctx.value ?? "",
    items: ctx.items ?? [],
    orientation: ctx.orientation ?? "horizontal",
    focusedIndex: 0,
    id: ctx.id,
    activationMode: ctx.activationMode ?? "automatic",
  };

  return {
    initialState: "idle" as TabsState,
    initialContext,
    transition,
  };
}
