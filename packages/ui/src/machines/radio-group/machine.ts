import type { MachineDefinition } from "@/machines/shared/types";
import { Keys, getNextIndex, isKey } from "@/machines/shared";
import type { RadioGroupState, RadioGroupContext, RadioGroupEvent } from "./types";

export function createRadioGroupMachine(
  initialContext: Partial<RadioGroupContext> = {},
): MachineDefinition<RadioGroupState, RadioGroupContext, RadioGroupEvent> {
  const context: RadioGroupContext = {
    value: null,
    disabled: false,
    readOnly: false,
    required: false,
    orientation: "vertical",
    loop: true,
    focusedValue: null,
    ...initialContext,
  };

  return {
    initialState: "idle",
    initialContext: context,
    transition(state, ctx, event) {
      switch (event.type) {
        case "SET_VALUE": {
          if (ctx.disabled || ctx.readOnly) {
            return { state, context: ctx };
          }
          const nextCtx = { ...ctx, value: event.value };
          return { state, context: nextCtx };
        }

        case "FOCUS": {
          const nextCtx = { ...ctx, focusedValue: event.value };
          return { state: "focused", context: nextCtx };
        }

        case "BLUR": {
          const nextCtx = { ...ctx, focusedValue: null };
          return { state: "idle", context: nextCtx };
        }

        case "KEY_DOWN": {
          const { key, items } = event;

          if (ctx.disabled) {
            return { state, context: ctx };
          }

          // Space로 현재 포커스된 아이템 선택
          if (isKey(key, Keys.Space)) {
            if (ctx.focusedValue && !ctx.readOnly) {
              const nextCtx = { ...ctx, value: ctx.focusedValue };
              return { state, context: nextCtx };
            }
            return { state, context: ctx };
          }

          // 방향키로 포커스 이동 + 선택
          if (
            isKey(key, Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight) &&
            items.length > 0
          ) {
            const currentIndex = ctx.focusedValue ? items.indexOf(ctx.focusedValue) : -1;
            const nextIndex = getNextIndex(key, currentIndex, items.length, {
              orientation: ctx.orientation,
              loop: ctx.loop,
            });
            const nextValue = items[nextIndex]!;

            // WAI-ARIA: 라디오그룹에서 방향키는 포커스 이동과 동시에 선택
            const nextCtx = {
              ...ctx,
              focusedValue: nextValue,
              ...(ctx.readOnly ? {} : { value: nextValue }),
            };

            return {
              state: "focused",
              context: nextCtx,
              effects: [{ type: "focus" as const, target: `${nextValue}-radio` }],
            };
          }

          return { state, context: ctx };
        }

        case "SET_CONTEXT": {
          const nextCtx = { ...ctx, ...event.context };
          return { state, context: nextCtx };
        }

        default:
          return { state, context: ctx };
      }
    },
  };
}
