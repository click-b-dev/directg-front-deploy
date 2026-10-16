import type { Send } from "@/machines/shared/types";
import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import { Keys } from "@/machines/shared";
import type { SwitchState, SwitchContext, SwitchEvent } from "./types";

export interface SwitchApi {
  /** checked 상태인지 여부 */
  isChecked: boolean;
  /** disabled 상태인지 여부 */
  isDisabled: boolean;

  /** checked 상태를 설정 */
  setChecked(checked: boolean): void;
  /** toggle */
  toggle(): void;

  /** root 요소 props */
  getRootProps(): Record<string, unknown>;
  /** control 요소 props (스위치 트랙) */
  getControlProps(): Record<string, unknown>;
  /** thumb 요소 props (스위치 핸들) */
  getThumbProps(): Record<string, unknown>;
  /** label 요소 props */
  getLabelProps(): Record<string, unknown>;
  /** hidden input props (폼 전송용) */
  getHiddenInputProps(): Record<string, unknown>;
}

export function connect(
  state: SwitchState,
  context: SwitchContext,
  send: Send<SwitchEvent>,
  ids: { root: string; control: string; label: string; input: string },
): SwitchApi {
  const isChecked = state === "checked";
  const isDisabled = context.disabled;

  return {
    isChecked,
    isDisabled,

    setChecked(checked: boolean) {
      send({ type: "SET_CHECKED", checked });
    },

    toggle() {
      send({ type: "TOGGLE" });
    },

    getRootProps() {
      return {
        "data-scope": "switch",
        "data-part": "root",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        id: ids.root,
      };
    },

    getControlProps() {
      return {
        "data-scope": "switch",
        "data-part": "control",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        id: ids.control,
        role: "switch",
        "aria-checked": ariaAttr(isChecked),
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
        "aria-labelledby": ids.label,
        tabIndex: isDisabled ? undefined : 0,
        onKeyDown: composeEventHandlers((event: KeyboardEvent) => {
          if (event.key === Keys.Space) {
            event.preventDefault();
            send({ type: "TOGGLE" });
          }
          if (event.key === Keys.Enter) {
            event.preventDefault();
            send({ type: "TOGGLE" });
          }
        }),
        onClick: composeEventHandlers(() => {
          send({ type: "TOGGLE" });
        }),
      };
    },

    getThumbProps() {
      return {
        "data-scope": "switch",
        "data-part": "thumb",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        "aria-hidden": "true" as const,
      };
    },

    getLabelProps() {
      return {
        "data-scope": "switch",
        "data-part": "label",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        id: ids.label,
        htmlFor: ids.input,
        onClick: composeEventHandlers(() => {
          if (!isDisabled) {
            send({ type: "TOGGLE" });
          }
        }),
      };
    },

    getHiddenInputProps() {
      return {
        type: "checkbox" as const,
        role: "switch" as const,
        "data-scope": "switch",
        "data-part": "hiddenInput",
        id: ids.input,
        name: context.name,
        value: context.value,
        checked: isChecked,
        disabled: isDisabled,
        readOnly: context.readOnly,
        required: context.required,
        "aria-hidden": "true" as const,
        tabIndex: -1,
        style: {
          position: "absolute" as const,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap" as const,
          border: "0",
        },
        onChange: composeEventHandlers(() => {
          send({ type: "TOGGLE" });
        }),
      };
    },
  };
}
