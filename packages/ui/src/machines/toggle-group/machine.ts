/**
 * ToggleGroup 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey, getNextIndex } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { ToggleGroupState, ToggleGroupContext, ToggleGroupEvent } from "./types";

function getEnabledItems(ctx: ToggleGroupContext): string[] {
  return ctx.items.filter((item) => !ctx.disabledItems.includes(item));
}

function getItemId(ctx: ToggleGroupContext, value: string): string {
  return `${ctx.id}:item:${value}`;
}

function toggleValue(ctx: ToggleGroupContext, value: string): string[] {
  const isActive = ctx.value.includes(value);

  if (ctx.multiple) {
    return isActive ? ctx.value.filter((v) => v !== value) : [...ctx.value, value];
  }

  // single 모드: 이미 활성이면 해제, 아니면 교체
  return isActive ? [] : [value];
}

export function transition(
  state: ToggleGroupState,
  ctx: ToggleGroupContext,
  event: ToggleGroupEvent,
): TransitionResult<ToggleGroupState, ToggleGroupContext> {
  switch (event.type) {
    case "ITEM_TOGGLE": {
      if (ctx.disabled || ctx.disabledItems.includes(event.value)) {
        return { state, context: ctx };
      }
      const nextValue = toggleValue(ctx, event.value);
      return { state, context: { ...ctx, value: nextValue } };
    }

    case "ITEM_FOCUS": {
      return { state, context: { ...ctx, focusedIndex: event.index } };
    }

    case "KEY_DOWN": {
      const enabledItems = getEnabledItems(ctx);
      const count = enabledItems.length;
      if (count === 0) return { state, context: ctx };

      // 현재 포커스된 아이템의 enabled 아이템 내 인덱스 계산
      const currentItem = ctx.items[ctx.focusedIndex];
      const enabledIndex = currentItem ? enabledItems.indexOf(currentItem) : 0;

      if (isKey(event.key, Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight)) {
        const nextEnabledIdx = getNextIndex(event.key, enabledIndex, count, {
          orientation: ctx.orientation,
          loop: ctx.loop,
        });
        const nextItem = enabledItems[nextEnabledIdx];
        if (!nextItem) return { state, context: ctx };

        const nextGlobalIndex = ctx.items.indexOf(nextItem);
        return {
          state,
          context: { ...ctx, focusedIndex: nextGlobalIndex },
          effects: [{ type: "focus", target: getItemId(ctx, nextItem) }],
        };
      }

      if (isKey(event.key, Keys.Home)) {
        const firstItem = enabledItems[0];
        if (!firstItem) return { state, context: ctx };
        return {
          state,
          context: { ...ctx, focusedIndex: ctx.items.indexOf(firstItem) },
          effects: [{ type: "focus", target: getItemId(ctx, firstItem) }],
        };
      }

      if (isKey(event.key, Keys.End)) {
        const lastItem = enabledItems[count - 1];
        if (!lastItem) return { state, context: ctx };
        return {
          state,
          context: { ...ctx, focusedIndex: ctx.items.indexOf(lastItem) },
          effects: [{ type: "focus", target: getItemId(ctx, lastItem) }],
        };
      }

      if (isKey(event.key, Keys.Enter, Keys.Space)) {
        const current = ctx.items[ctx.focusedIndex];
        if (!current || ctx.disabledItems.includes(current)) return { state, context: ctx };
        const nextValue = toggleValue(ctx, current);
        return { state, context: { ...ctx, value: nextValue } };
      }

      return { state, context: ctx };
    }

    case "SET_VALUE": {
      return { state, context: { ...ctx, value: event.value } };
    }

    case "SET_ITEMS": {
      return {
        state,
        context: { ...ctx, items: event.items, disabledItems: event.disabledItems },
      };
    }

    default:
      return { state, context: ctx };
  }
}

export function createToggleGroupMachine(ctx: Partial<ToggleGroupContext> & { id: string }) {
  const initialContext: ToggleGroupContext = {
    value: ctx.value ?? [],
    multiple: ctx.multiple ?? false,
    disabled: ctx.disabled ?? false,
    focusedIndex: -1,
    items: ctx.items ?? [],
    disabledItems: ctx.disabledItems ?? [],
    orientation: ctx.orientation ?? "horizontal",
    loop: ctx.loop ?? true,
    id: ctx.id,
  };

  return {
    initialState: "idle" as ToggleGroupState,
    initialContext,
    transition,
  };
}
