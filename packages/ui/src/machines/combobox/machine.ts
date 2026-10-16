/**
 * Combobox 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult, Effect } from "@/machines/shared";
import type { ComboboxState, ComboboxContext, ComboboxEvent, ComboboxItem } from "./types";

function getInputId(ctx: ComboboxContext): string {
  return `${ctx.id}:input`;
}

function getItemId(ctx: ComboboxContext, value: string): string {
  return `${ctx.id}:item:${value}`;
}

function getEnabledItems(ctx: ComboboxContext): ComboboxItem[] {
  return ctx.filteredItems.filter((item) => !item.disabled);
}

function findNextEnabledValue(
  ctx: ComboboxContext,
  currentValue: string,
  direction: 1 | -1,
): string {
  const enabled = getEnabledItems(ctx);
  if (enabled.length === 0) return "";

  const currentIdx = enabled.findIndex((i) => i.value === currentValue);

  if (currentIdx === -1) {
    return direction === 1 ? enabled[0]!.value : enabled[enabled.length - 1]!.value;
  }

  if (direction === 1) {
    const nextIdx = currentIdx + 1 >= enabled.length ? 0 : currentIdx + 1;
    return enabled[nextIdx]!.value;
  } else {
    const prevIdx = currentIdx - 1 < 0 ? enabled.length - 1 : currentIdx - 1;
    return enabled[prevIdx]!.value;
  }
}

function findFirstEnabledValue(ctx: ComboboxContext): string {
  const enabled = getEnabledItems(ctx);
  return enabled[0]?.value ?? "";
}

function findLastEnabledValue(ctx: ComboboxContext): string {
  const enabled = getEnabledItems(ctx);
  return enabled[enabled.length - 1]?.value ?? "";
}

function highlightEffects(ctx: ComboboxContext, value: string): Effect[] {
  if (!value) return [];
  return [{ type: "scrollIntoView", target: getItemId(ctx, value) }];
}

function getLabelForValue(ctx: ComboboxContext, value: string): string {
  const item = ctx.items.find((i) => i.value === value);
  return item?.label ?? "";
}

function selectItem(
  ctx: ComboboxContext,
  value: string,
): { newValue: string[]; newInputValue: string } {
  const item = ctx.items.find((i) => i.value === value);
  if (!item || item.disabled) return { newValue: ctx.value, newInputValue: ctx.inputValue };

  if (ctx.multiple) {
    const exists = ctx.value.includes(value);
    const newValue = exists ? ctx.value.filter((v) => v !== value) : [...ctx.value, value];
    return { newValue, newInputValue: "" };
  }

  return { newValue: [value], newInputValue: item.label };
}

export function transition(
  state: ComboboxState,
  ctx: ComboboxContext,
  event: ComboboxEvent,
): TransitionResult<ComboboxState, ComboboxContext> {
  // Global events handled regardless of state
  switch (event.type) {
    case "SET_VALUE": {
      const same =
        ctx.value.length === event.value.length && ctx.value.every((v, i) => v === event.value[i]);
      if (same) return { state, context: ctx };
      const inputValue =
        !ctx.multiple && event.value.length > 0
          ? getLabelForValue(ctx, event.value[0]!)
          : ctx.inputValue;
      return { state, context: { ...ctx, value: event.value, inputValue } };
    }
    case "SET_INPUT_VALUE":
      if (ctx.inputValue === event.value) return { state, context: ctx };
      return { state, context: { ...ctx, inputValue: event.value } };
    case "SET_ITEMS":
      if (ctx.items === event.items) return { state, context: ctx };
      return { state, context: { ...ctx, items: event.items, filteredItems: event.items } };
    case "SET_FILTERED_ITEMS":
      if (ctx.filteredItems === event.items) return { state, context: ctx };
      return { state, context: { ...ctx, filteredItems: event.items } };
    case "CLEAR_TYPEAHEAD":
      return { state, context: { ...ctx, typeaheadBuffer: "" } };
    default:
      break;
  }

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
  ctx: ComboboxContext,
  event: ComboboxEvent,
): TransitionResult<ComboboxState, ComboboxContext> {
  switch (event.type) {
    case "INPUT_FOCUS": {
      return { state: "closed", context: ctx };
    }

    case "INPUT_CHANGE": {
      if (ctx.readOnly || ctx.disabled) return { state: "closed", context: ctx };
      const newInputValue = event.value;
      if (ctx.openOnInput && newInputValue.length > 0) {
        const highlightedValue = findFirstEnabledValue({
          ...ctx,
          inputValue: newInputValue,
        });
        return {
          state: "open",
          context: {
            ...ctx,
            inputValue: newInputValue,
            highlightedValue,
            navigationMode: "input",
          },
        };
      }
      return {
        state: "closed",
        context: { ...ctx, inputValue: newInputValue },
      };
    }

    case "INPUT_KEY_DOWN": {
      if (ctx.disabled) return { state: "closed", context: ctx };

      if (isKey(event.key, Keys.ArrowDown)) {
        const highlightedValue = findFirstEnabledValue(ctx);
        return {
          state: "open",
          context: {
            ...ctx,
            highlightedValue,
            navigationMode: "list",
          },
          effects: highlightEffects(ctx, highlightedValue),
        };
      }

      if (isKey(event.key, Keys.ArrowUp)) {
        const highlightedValue = findLastEnabledValue(ctx);
        return {
          state: "open",
          context: {
            ...ctx,
            highlightedValue,
            navigationMode: "list",
          },
          effects: highlightEffects(ctx, highlightedValue),
        };
      }

      return { state: "closed", context: ctx };
    }

    case "TRIGGER_CLICK": {
      if (ctx.disabled) return { state: "closed", context: ctx };
      const highlightedValue = ctx.value.length > 0 ? ctx.value[0]! : findFirstEnabledValue(ctx);
      return {
        state: "open",
        context: {
          ...ctx,
          highlightedValue,
          navigationMode: "input",
        },
        effects: [
          { type: "focus", target: getInputId(ctx) },
          ...highlightEffects(ctx, highlightedValue),
        ],
      };
    }

    case "CLEAR_CLICK": {
      return {
        state: "closed",
        context: {
          ...ctx,
          value: [],
          inputValue: "",
          highlightedValue: "",
        },
        effects: [{ type: "focus", target: getInputId(ctx) }],
      };
    }

    default:
      return { state: "closed", context: ctx };
  }
}

function openTransition(
  ctx: ComboboxContext,
  event: ComboboxEvent,
): TransitionResult<ComboboxState, ComboboxContext> {
  switch (event.type) {
    case "INPUT_CHANGE": {
      if (ctx.readOnly) return { state: "open", context: ctx };
      const newInputValue = event.value;
      const highlightedValue = findFirstEnabledValue({ ...ctx, inputValue: newInputValue });
      return {
        state: "open",
        context: {
          ...ctx,
          inputValue: newInputValue,
          highlightedValue,
          navigationMode: "input",
        },
      };
    }

    case "INPUT_BLUR": {
      return {
        state: "closed",
        context: { ...ctx, highlightedValue: "", navigationMode: "input" },
      };
    }

    case "INPUT_KEY_DOWN": {
      if (isKey(event.key, Keys.ArrowDown)) {
        const nextValue = ctx.highlightedValue
          ? findNextEnabledValue(ctx, ctx.highlightedValue, 1)
          : findFirstEnabledValue(ctx);
        return {
          state: "open",
          context: {
            ...ctx,
            highlightedValue: nextValue,
            navigationMode: "list",
          },
          effects: highlightEffects(ctx, nextValue),
        };
      }

      if (isKey(event.key, Keys.ArrowUp)) {
        const prevValue = ctx.highlightedValue
          ? findNextEnabledValue(ctx, ctx.highlightedValue, -1)
          : findLastEnabledValue(ctx);
        return {
          state: "open",
          context: {
            ...ctx,
            highlightedValue: prevValue,
            navigationMode: "list",
          },
          effects: highlightEffects(ctx, prevValue),
        };
      }

      if (isKey(event.key, Keys.Home)) {
        const firstValue = findFirstEnabledValue(ctx);
        return {
          state: "open",
          context: {
            ...ctx,
            highlightedValue: firstValue,
            navigationMode: "list",
          },
          effects: highlightEffects(ctx, firstValue),
        };
      }

      if (isKey(event.key, Keys.End)) {
        const lastValue = findLastEnabledValue(ctx);
        return {
          state: "open",
          context: {
            ...ctx,
            highlightedValue: lastValue,
            navigationMode: "list",
          },
          effects: highlightEffects(ctx, lastValue),
        };
      }

      if (isKey(event.key, Keys.Enter)) {
        if (ctx.highlightedValue) {
          const { newValue, newInputValue } = selectItem(ctx, ctx.highlightedValue);
          if (ctx.multiple) {
            return {
              state: "open",
              context: {
                ...ctx,
                value: newValue,
                inputValue: newInputValue,
                highlightedValue: ctx.highlightedValue,
              },
            };
          }
          return {
            state: "closed",
            context: {
              ...ctx,
              value: newValue,
              inputValue: newInputValue,
              highlightedValue: "",
              navigationMode: "input",
            },
            effects: [{ type: "focus", target: getInputId(ctx) }],
          };
        }
        return { state: "open", context: ctx };
      }

      if (isKey(event.key, Keys.Escape)) {
        return {
          state: "closed",
          context: { ...ctx, highlightedValue: "", navigationMode: "input" },
          effects: [{ type: "focus", target: getInputId(ctx) }],
        };
      }

      if (isKey(event.key, Keys.Tab)) {
        // Tab closes and selects highlighted if any
        if (ctx.highlightedValue) {
          const { newValue, newInputValue } = selectItem(ctx, ctx.highlightedValue);
          return {
            state: "closed",
            context: {
              ...ctx,
              value: newValue,
              inputValue: newInputValue,
              highlightedValue: "",
              navigationMode: "input",
            },
          };
        }
        return {
          state: "closed",
          context: { ...ctx, highlightedValue: "", navigationMode: "input" },
        };
      }

      return { state: "open", context: ctx };
    }

    case "TRIGGER_CLICK": {
      return {
        state: "closed",
        context: { ...ctx, highlightedValue: "", navigationMode: "input" },
        effects: [{ type: "focus", target: getInputId(ctx) }],
      };
    }

    case "CLEAR_CLICK": {
      return {
        state: "closed",
        context: {
          ...ctx,
          value: [],
          inputValue: "",
          highlightedValue: "",
          navigationMode: "input",
        },
        effects: [{ type: "focus", target: getInputId(ctx) }],
      };
    }

    case "ITEM_CLICK": {
      const item = ctx.items.find((i) => i.value === event.value);
      if (!item || item.disabled) return { state: "open", context: ctx };

      const { newValue, newInputValue } = selectItem(ctx, event.value);

      if (ctx.multiple) {
        return {
          state: "open",
          context: {
            ...ctx,
            value: newValue,
            inputValue: newInputValue,
            highlightedValue: event.value,
          },
          effects: [{ type: "focus", target: getInputId(ctx) }],
        };
      }

      return {
        state: "closed",
        context: {
          ...ctx,
          value: newValue,
          inputValue: newInputValue,
          highlightedValue: "",
          navigationMode: "input",
        },
        effects: [{ type: "focus", target: getInputId(ctx) }],
      };
    }

    case "ITEM_HOVER": {
      const item = ctx.filteredItems.find((i) => i.value === event.value);
      if (!item || item.disabled) return { state: "open", context: ctx };
      return {
        state: "open",
        context: { ...ctx, highlightedValue: event.value },
      };
    }

    case "CLOSE": {
      return {
        state: "closed",
        context: { ...ctx, highlightedValue: "", navigationMode: "input" },
      };
    }

    default:
      return { state: "open", context: ctx };
  }
}

export function createComboboxMachine(ctx: Partial<ComboboxContext> & { id: string }) {
  const items = ctx.items ?? [];
  const value = ctx.value ?? [];
  const inputValue =
    ctx.inputValue ??
    (!ctx.multiple && value.length > 0
      ? (items.find((i) => i.value === value[0])?.label ?? "")
      : "");

  const initialContext: ComboboxContext = {
    value,
    inputValue,
    highlightedValue: "",
    items,
    filteredItems: items,
    id: ctx.id,
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
    multiple: ctx.multiple ?? false,
    autoComplete: ctx.autoComplete ?? "list",
    openOnInput: ctx.openOnInput ?? true,
    typeaheadBuffer: "",
    navigationMode: "input",
  };

  return {
    initialState: "closed" as ComboboxState,
    initialContext,
    transition,
  };
}
