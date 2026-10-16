import type { MachineDefinition } from "@/machines/shared/types";
import type { CheckboxState, CheckboxContext, CheckboxEvent, CheckedState } from "./types";

function toState(checked: CheckedState): CheckboxState {
  if (checked === "indeterminate") return "indeterminate";
  return checked ? "checked" : "unchecked";
}

function toggleChecked(checked: CheckedState): CheckedState {
  if (checked === "indeterminate") return true;
  return !checked;
}

export function createCheckboxMachine(
  initialContext: Partial<CheckboxContext> = {},
): MachineDefinition<CheckboxState, CheckboxContext, CheckboxEvent> {
  const context: CheckboxContext = {
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
          const nextChecked = toggleChecked(ctx.checked);
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
