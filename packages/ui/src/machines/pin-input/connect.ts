/**
 * PinInput connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { PinInputState, PinInputContext, PinInputEvent } from "./types";
import { SCOPE, pinInputAnatomy } from "./anatomy";

export interface PinInputApi {
  value: string[];
  valueAsString: string;
  isComplete: boolean;
  setValue(value: string[]): void;
  clear(): void;
  getRootProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getControlProps(): Record<string, unknown>;
  getInputProps(props: { index: number }): Record<string, unknown>;
  getHiddenInputProps(): Record<string, unknown>;
}

export function connect(
  state: PinInputState,
  ctx: PinInputContext,
  send: Send<PinInputEvent>,
): PinInputApi {
  const isFocused = state === "focused";
  const isComplete = ctx.value.every((v) => v.length > 0);
  const valueAsString = ctx.value.join("");

  function getInputId(index: number): string {
    return `${ctx.id}:input:${index}`;
  }

  function getLabelId(): string {
    return `${ctx.id}:label`;
  }

  return {
    value: ctx.value,
    valueAsString,
    isComplete,

    setValue(value: string[]) {
      send({ type: "SET_VALUE", value });
    },

    clear() {
      send({ type: "CLEAR" });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": pinInputAnatomy.root,
        "data-disabled": dataAttr(ctx.disabled),
        "data-complete": dataAttr(isComplete),
        id: ctx.id,
      };
    },

    getLabelProps() {
      return {
        id: getLabelId(),
        "data-scope": SCOPE,
        "data-part": pinInputAnatomy.label,
        "data-disabled": dataAttr(ctx.disabled),
        htmlFor: getInputId(0),
      };
    },

    getControlProps() {
      return {
        "data-scope": SCOPE,
        "data-part": pinInputAnatomy.control,
        "data-disabled": dataAttr(ctx.disabled),
        "data-complete": dataAttr(isComplete),
        "data-focus": dataAttr(isFocused),
        role: "group",
        "aria-labelledby": getLabelId(),
      };
    },

    getInputProps(props) {
      const { index } = props;
      const isCurrent = ctx.focusedIndex === index;
      const hasValue = ctx.value[index] !== undefined && ctx.value[index] !== "";

      return {
        id: getInputId(index),
        "data-scope": SCOPE,
        "data-part": pinInputAnatomy.input,
        "data-disabled": dataAttr(ctx.disabled),
        "data-focus": dataAttr(isCurrent && isFocused),
        "data-complete": dataAttr(isComplete),
        type: ctx.mask ? ("password" as const) : ("text" as const),
        inputMode: ctx.pattern === "[0-9]" ? ("numeric" as const) : ("text" as const),
        autoComplete: ctx.otp ? ("one-time-code" as const) : ("off" as const),
        autoCorrect: "off",
        spellCheck: false,
        maxLength: 1,
        disabled: ctx.disabled,
        readOnly: ctx.readOnly,
        required: ctx.required,
        placeholder: isCurrent ? "" : ctx.placeholder,
        value: ctx.value[index] ?? "",
        "aria-label": `Pin code digit ${index + 1} of ${ctx.length}`,
        "aria-disabled": ctx.disabled ? ariaAttr(true) : undefined,
        "aria-readonly": ctx.readOnly ? ariaAttr(true) : undefined,
        "aria-required": ctx.required ? ariaAttr(true) : undefined,
        style: {
          textAlign: "center" as const,
          ...(ctx.mask && hasValue ? { WebkitTextSecurity: "disc" as const } : {}),
        },
        onInput: composeEventHandlers((e: Event) => {
          const target = e.target as HTMLInputElement;
          const inputValue = target.value;

          // 붙여넣기로 여러 문자가 입력된 경우
          if (inputValue.length > 1) {
            send({ type: "PASTE", index, value: inputValue });
          } else {
            send({ type: "INPUT", index, value: inputValue });
          }
        }),
        onPaste: composeEventHandlers((e: ClipboardEvent) => {
          e.preventDefault();
          const pasteData = e.clipboardData?.getData("text/plain") ?? "";
          if (pasteData) {
            send({ type: "PASTE", index, value: pasteData });
          }
        }),
        onFocus: composeEventHandlers(() => {
          send({ type: "FOCUS", index });
          // 포커스 시 텍스트 전체 선택
          const target = document.getElementById(getInputId(index)) as HTMLInputElement | null;
          target?.select();
        }),
        onBlur: composeEventHandlers(() => {
          send({ type: "BLUR" });
        }),
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (ctx.disabled) return;

          if (e.key === "Backspace") {
            e.preventDefault();
            send({ type: "BACKSPACE", index });
            return;
          }

          if (e.key === "Delete") {
            e.preventDefault();
            send({ type: "DELETE", index });
            return;
          }

          const navKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];
          if (navKeys.includes(e.key)) {
            e.preventDefault();
            send({ type: "KEY_DOWN", index, key: e.key });
          }
        }),
      };
    },

    getHiddenInputProps() {
      return {
        "data-scope": SCOPE,
        "data-part": pinInputAnatomy.hiddenInput,
        type: "hidden" as const,
        name: ctx.name,
        value: valueAsString,
        disabled: ctx.disabled,
        readOnly: ctx.readOnly,
        required: ctx.required,
        "aria-hidden": "true" as const,
      };
    },
  };
}
