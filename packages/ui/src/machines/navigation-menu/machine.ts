import { Keys, isKey, getNextIndex } from "@/machines/shared";
import type { TransitionResult, Effect } from "@/machines/shared";
import type { NavigationMenuState, NavigationMenuContext, NavigationMenuEvent } from "./types";

function getEnabledItems(ctx: NavigationMenuContext) {
  return ctx.items.filter((item) => !item.disabled);
}

function getItemIndex(ctx: NavigationMenuContext, value: string): number {
  return getEnabledItems(ctx).findIndex((item) => item.value === value);
}

function getTriggerId(ctx: NavigationMenuContext, value: string): string {
  return `${ctx.id}:trigger:${value}`;
}

export function transition(
  state: NavigationMenuState,
  ctx: NavigationMenuContext,
  event: NavigationMenuEvent,
): TransitionResult<NavigationMenuState, NavigationMenuContext> {
  switch (event.type) {
    case "TRIGGER_CLICK": {
      const item = ctx.items.find((i) => i.value === event.value);
      if (item?.disabled) return { state, context: ctx };

      if (state === "open" && ctx.value === event.value) {
        return {
          state: "idle",
          context: { ...ctx, value: null, focusedIndex: getItemIndex(ctx, event.value) },
        };
      }

      return {
        state: "open",
        context: {
          ...ctx,
          value: event.value,
          focusedIndex: getItemIndex(ctx, event.value),
        },
      };
    }

    case "TRIGGER_HOVER": {
      const item = ctx.items.find((i) => i.value === event.value);
      if (item?.disabled) return { state, context: ctx };

      return {
        state: "open",
        context: {
          ...ctx,
          value: event.value,
          focusedIndex: getItemIndex(ctx, event.value),
        },
      };
    }

    case "TRIGGER_LEAVE": {
      // Trigger leave는 바로 닫지 않음 (content로 이동할 수 있으므로)
      return { state, context: ctx };
    }

    case "CONTENT_HOVER": {
      // Content에 hover 중이면 열린 상태 유지
      return { state, context: ctx };
    }

    case "CONTENT_LEAVE": {
      return {
        state: "idle",
        context: { ...ctx, value: null },
      };
    }

    case "ESCAPE": {
      if (state === "open" && ctx.value !== null) {
        const triggerId = getTriggerId(ctx, ctx.value);
        return {
          state: "idle",
          context: { ...ctx, value: null },
          effects: [{ type: "focus", target: triggerId }],
        };
      }
      return { state, context: ctx };
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

        return {
          state,
          context: { ...ctx, focusedIndex: nextIdx },
          effects,
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

        if (state === "open" && ctx.value === currentItem.value) {
          return {
            state: "idle",
            context: { ...ctx, value: null },
          };
        }

        return {
          state: "open",
          context: { ...ctx, value: currentItem.value },
        };
      }

      if (isKey(event.key, Keys.Escape)) {
        return transition(state, ctx, { type: "ESCAPE" });
      }

      return { state, context: ctx };
    }

    case "SET_VALUE": {
      if (event.value === null) {
        return { state: "idle", context: { ...ctx, value: null } };
      }
      return { state: "open", context: { ...ctx, value: event.value } };
    }

    case "SET_ITEMS": {
      return { state, context: { ...ctx, items: event.items } };
    }

    case "SET_ORIENTATION": {
      return { state, context: { ...ctx, orientation: event.orientation } };
    }

    case "FOCUS_TRIGGER": {
      const idx = getItemIndex(ctx, event.value);
      if (idx === -1) return { state, context: ctx };
      return { state, context: { ...ctx, focusedIndex: idx } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createNavigationMenuMachine(ctx: Partial<NavigationMenuContext> & { id: string }) {
  const initialContext: NavigationMenuContext = {
    value: ctx.value ?? null,
    items: ctx.items ?? [],
    orientation: ctx.orientation ?? "horizontal",
    focusedIndex: 0,
    id: ctx.id,
  };

  return {
    initialState: (ctx.value !== null && ctx.value !== undefined
      ? "open"
      : "idle") as NavigationMenuState,
    initialContext,
    transition,
  };
}
