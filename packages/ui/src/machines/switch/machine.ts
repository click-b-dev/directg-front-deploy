import type { MachineDefinition } from "@/machines/shared/types";
import type { SwitchState, SwitchContext, SwitchEvent } from "./types";

function toState(checked: boolean): SwitchState {
  return checked ? "checked" : "unchecked";
}

export function createSwitchMachine(
  initialContext: Partial<SwitchContext> = {},
): MachineDefinition<SwitchState, SwitchContext, SwitchEvent> {
  const context: SwitchContext = {
    checked: false,
    disabled: false,
    readOnly: false,
    required: false,
    value: "on",
    ...initialContext,
  };

  return {
    initialState: toState(context.checked),
    initialContext: context,
    transition(state, ctx, event) {
      switch (event.type) {
        case "TOGGLE": {
          if (ctx.disabled || ctx.readOnly) {
            return { state, context: ctx };
          }
          const nextChecked = !ctx.checked;
          const nextCtx = { ...ctx, checked: nextChecked };
          return { state: toState(nextChecked), context: nextCtx };
        }
        case "SET_CHECKED": {
          const nextCtx = { ...ctx, checked: event.checked };
          return { state: toState(event.checked), context: nextCtx };
        }
        case "SET_CONTEXT": {
          const nextCtx = { ...ctx, ...event.context };
          return { state: toState(nextCtx.checked), context: nextCtx };
        }
        default:
          return { state, context: ctx };
      }
    },
  };
}
