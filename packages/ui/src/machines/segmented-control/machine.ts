import type { MachineDefinition } from "@/machines/shared/types";
import { Keys, getNextIndex, isKey } from "@/machines/shared";
import type {
  SegmentedControlState,
  SegmentedControlContext,
  SegmentedControlEvent,
} from "./types";

export function createSegmentedControlMachine(
  initialContext: Partial<SegmentedControlContext> = {},
): MachineDefinition<SegmentedControlState, SegmentedControlContext, SegmentedControlEvent> {
  const context: SegmentedControlContext = {
    value: null,
    disabled: false,
    orientation: "horizontal",
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
          if (ctx.disabled) {
            return { state, context: ctx };
          }
          return { state, context: { ...ctx, value: event.value } };
        }

        case "FOCUS": {
          return { state: "focused", context: { ...ctx, focusedValue: event.value } };
        }

        case "BLUR": {
          return { state: "idle", context: { ...ctx, focusedValue: null } };
        }

        case "KEY_DOWN": {
          const { key, items } = event;

          if (ctx.disabled) {
            return { state, context: ctx };
          }

          if (isKey(key, Keys.Space, Keys.Enter)) {
            if (ctx.focusedValue) {
              return { state, context: { ...ctx, value: ctx.focusedValue } };
            }
            return { state, context: ctx };
          }

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

            return {
              state: "focused",
              context: { ...ctx, focusedValue: nextValue },
              effects: [{ type: "focus" as const, target: `${nextValue}-segment` }],
            };
          }

          if (isKey(key, Keys.Home) && items.length > 0) {
            const firstValue = items[0]!;
            return {
              state: "focused",
              context: { ...ctx, focusedValue: firstValue },
              effects: [{ type: "focus" as const, target: `${firstValue}-segment` }],
            };
          }

          if (isKey(key, Keys.End) && items.length > 0) {
            const lastValue = items[items.length - 1]!;
            return {
              state: "focused",
              context: { ...ctx, focusedValue: lastValue },
              effects: [{ type: "focus" as const, target: `${lastValue}-segment` }],
            };
          }

          return { state, context: ctx };
        }

        case "SET_CONTEXT": {
          return { state, context: { ...ctx, ...event.context } };
        }

        default:
          return { state, context: ctx };
      }
    },
  };
}
