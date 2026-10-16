/**
 * NumberInput connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { NumberInputState, NumberInputContext, NumberInputEvent } from "./types";
import { SCOPE, numberInputAnatomy } from "./anatomy";

export interface NumberInputApi {
  value: number;
  inputValue: string;
  isAtMin: boolean;
  isAtMax: boolean;
  setValue(value: number): void;
  increment(): void;
  decrement(): void;
  getRootProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getInputProps(): Record<string, unknown>;
  getIncrementTriggerProps(): Record<string, unknown>;
  getDecrementTriggerProps(): Record<string, unknown>;
  getScrubberProps(): Record<string, unknown>;
  getValueTextProps(): Record<string, unknown>;
}

export function connect(
  state: NumberInputState,
  ctx: NumberInputContext,
  send: Send<NumberInputEvent>,
): NumberInputApi {
  const isAtMin = ctx.value <= ctx.min;
  const isAtMax = ctx.value >= ctx.max;
  const isFocused = state === "focused" || state === "spinning";

  function getInputId(): string {
    return `${ctx.id}:input`;
  }

  function getLabelId(): string {
    return `${ctx.id}:label`;
  }

  return {
    value: ctx.value,
    inputValue: ctx.inputValue,
    isAtMin,
    isAtMax,

    setValue(value: number) {
      send({ type: "SET_VALUE", value });
    },

    increment() {
      send({ type: "INCREMENT" });
    },

    decrement() {
      send({ type: "DECREMENT" });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": numberInputAnatomy.root,
        "data-disabled": dataAttr(ctx.disabled),
        "data-focus": dataAttr(isFocused),
        id: ctx.id,
      };
    },

    getLabelProps() {
      return {
        id: getLabelId(),
        "data-scope": SCOPE,
        "data-part": numberInputAnatomy.label,
        "data-disabled": dataAttr(ctx.disabled),
        htmlFor: getInputId(),
      };
    },

    getInputProps() {
      return {
        id: getInputId(),
        "data-scope": SCOPE,
        "data-part": numberInputAnatomy.input,
        "data-disabled": dataAttr(ctx.disabled),
        role: "spinbutton",
        inputMode: "decimal" as const,
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: false,
        type: "text" as const,
        name: ctx.name,
        disabled: ctx.disabled,
        readOnly: ctx.readOnly,
        required: ctx.required,
        value: ctx.inputValue,
        "aria-valuenow": ctx.value,
        "aria-valuemin": ctx.min === -Infinity ? undefined : ctx.min,
        "aria-valuemax": ctx.max === Infinity ? undefined : ctx.max,
        "aria-valuetext": ctx.inputValue,
        "aria-disabled": ctx.disabled ? ariaAttr(true) : undefined,
        "aria-readonly": ctx.readOnly ? ariaAttr(true) : undefined,
        "aria-required": ctx.required ? ariaAttr(true) : undefined,
        "aria-labelledby": getLabelId(),
        "aria-invalid": ariaAttr(false),
        onChange: composeEventHandlers((e: Event) => {
          const target = e.target as HTMLInputElement;
          send({ type: "INPUT_CHANGE", inputValue: target.value });
        }),
        onFocus: composeEventHandlers(() => {
          send({ type: "INPUT_FOCUS" });
        }),
        onBlur: composeEventHandlers(() => {
          send({ type: "INPUT_BLUR" });
        }),
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (ctx.disabled || ctx.readOnly) return;
          const handled = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
          if (handled.includes(e.key)) {
            e.preventDefault();
            send({ type: "KEY_DOWN", key: e.key });
          }
        }),
      };
    },

    getIncrementTriggerProps() {
      const isDisabled = ctx.disabled || ctx.readOnly || isAtMax;

      return {
        "data-scope": SCOPE,
        "data-part": numberInputAnatomy.incrementTrigger,
        "data-disabled": dataAttr(isDisabled),
        type: "button" as const,
        tabIndex: -1,
        "aria-label": "Increment",
        disabled: isDisabled,
        onPointerDown: composeEventHandlers((e: PointerEvent) => {
          if (isDisabled) return;
          e.preventDefault();
          send({ type: "SPIN_START", direction: "increment" });

          const onPointerUp = () => {
            send({ type: "SPIN_STOP" });
            document.removeEventListener("pointerup", onPointerUp);
          };
          document.addEventListener("pointerup", onPointerUp);
        }),
        onClick: composeEventHandlers(() => {
          if (!isDisabled) {
            send({ type: "INCREMENT" });
          }
        }),
      };
    },

    getDecrementTriggerProps() {
      const isDisabled = ctx.disabled || ctx.readOnly || isAtMin;

      return {
        "data-scope": SCOPE,
        "data-part": numberInputAnatomy.decrementTrigger,
        "data-disabled": dataAttr(isDisabled),
        type: "button" as const,
        tabIndex: -1,
        "aria-label": "Decrement",
        disabled: isDisabled,
        onPointerDown: composeEventHandlers((e: PointerEvent) => {
          if (isDisabled) return;
          e.preventDefault();
          send({ type: "SPIN_START", direction: "decrement" });

          const onPointerUp = () => {
            send({ type: "SPIN_STOP" });
            document.removeEventListener("pointerup", onPointerUp);
          };
          document.addEventListener("pointerup", onPointerUp);
        }),
        onClick: composeEventHandlers(() => {
          if (!isDisabled) {
            send({ type: "DECREMENT" });
          }
        }),
      };
    },

    getScrubberProps() {
      return {
        "data-scope": SCOPE,
        "data-part": numberInputAnatomy.scrubber,
        "data-disabled": dataAttr(ctx.disabled),
        role: "presentation",
        style: { cursor: ctx.disabled ? "default" : "ew-resize" },
        onPointerDown: composeEventHandlers((e: PointerEvent) => {
          if (ctx.disabled || ctx.readOnly) return;
          e.preventDefault();
          const startX = e.clientX;

          const onPointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const steps = Math.round(deltaX / 10);
            if (steps > 0) {
              send({ type: "INCREMENT_BY", amount: Math.abs(steps) * ctx.step });
            } else if (steps < 0) {
              send({ type: "DECREMENT_BY", amount: Math.abs(steps) * ctx.step });
            }
          };

          const onPointerUp = () => {
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
          };

          document.addEventListener("pointermove", onPointerMove);
          document.addEventListener("pointerup", onPointerUp);
        }),
      };
    },

    getValueTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": numberInputAnatomy.valueText,
        "data-disabled": dataAttr(ctx.disabled),
      };
    },
  };
}
