import type { Send } from "@/machines/shared/types";
import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import { Keys } from "@/machines/shared";
import type { CheckboxState, CheckboxContext, CheckboxEvent, CheckedState } from "./types";

export interface CheckboxApi {
  /** 현재 checked 상태 */
  checked: CheckedState;
  /** checked 상태인지 여부 */
  isChecked: boolean;
  /** indeterminate 상태인지 여부 */
  isIndeterminate: boolean;
  /** disabled 상태인지 여부 */
  isDisabled: boolean;

  /** checked 상태를 설정 */
  setChecked(checked: CheckedState): void;
  /** toggle */
  toggle(): void;

  /** root 요소 props */
  getRootProps(): Record<string, unknown>;
  /** control 요소 props (시각적 체크박스) */
  getControlProps(): Record<string, unknown>;
  /** label 요소 props */
  getLabelProps(): Record<string, unknown>;
  /** indicator 요소 props (체크마크 등) */
  getIndicatorProps(): Record<string, unknown>;
  /** hidden input props (폼 전송용) */
  getHiddenInputProps(): Record<string, unknown>;
}

export function connect(
  state: CheckboxState,
  context: CheckboxContext,
  send: Send<CheckboxEvent>,
  ids: { root: string; control: string; label: string; input: string },
): CheckboxApi {
  const isChecked = state === "checked";
  const isIndeterminate = state === "indeterminate";
  const isDisabled = context.disabled;

  return {
    checked: context.checked,
    isChecked,
    isIndeterminate,
    isDisabled,

    setChecked(checked: CheckedState) {
      send({ type: "SET_CHECKED", checked });
    },

    toggle() {
      send({ type: "TOGGLE" });
    },

    getRootProps() {
      return {
        "data-scope": "checkbox",
        "data-part": "root",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        id: ids.root,
        onClick(event: MouseEvent) {
          // label 클릭 시 hidden input으로 전파되므로 root에서는 별도 처리 불요
          // 단, input이 아닌 root 직접 클릭 시 toggle
          const target = event.target as HTMLElement;
          if (target.tagName === "INPUT") return;
        },
      };
    },

    getControlProps() {
      return {
        "data-scope": "checkbox",
        "data-part": "control",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        id: ids.control,
        role: "checkbox",
        "aria-checked": isIndeterminate ? ("mixed" as const) : ariaAttr(isChecked),
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
        "aria-labelledby": ids.label,
        tabIndex: isDisabled ? undefined : 0,
        onKeyDown: composeEventHandlers((event: KeyboardEvent) => {
          if (event.key === Keys.Space) {
            event.preventDefault();
            send({ type: "TOGGLE" });
          }
        }),
        onClick: composeEventHandlers(() => {
          send({ type: "TOGGLE" });
        }),
      };
    },

    getLabelProps() {
      return {
        "data-scope": "checkbox",
        "data-part": "label",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        id: ids.label,
        htmlFor: ids.input,
      };
    },

    getIndicatorProps() {
      return {
        "data-scope": "checkbox",
        "data-part": "indicator",
        "data-state": state,
        "data-disabled": dataAttr(isDisabled),
        "aria-hidden": "true" as const,
      };
    },

    getHiddenInputProps() {
      return {
        type: "checkbox" as const,
        "data-scope": "checkbox",
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
