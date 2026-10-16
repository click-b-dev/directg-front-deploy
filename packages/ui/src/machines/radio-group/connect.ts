import type { Send } from "@/machines/shared/types";
import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import type { RadioGroupState, RadioGroupContext, RadioGroupEvent } from "./types";

export interface RadioGroupApi {
  /** 현재 선택된 값 */
  value: string | null;
  /** disabled 상태인지 여부 */
  isDisabled: boolean;

  /** 선택된 값을 설정 */
  setValue(value: string): void;

  /** root 요소 props */
  getRootProps(): Record<string, unknown>;
  /** indicator 요소 props (선택된 아이템 위에 표시되는 인디케이터) */
  getIndicatorProps(): Record<string, unknown>;
  /** 개별 아이템 props */
  getItemProps(itemProps: { value: string; disabled?: boolean }): Record<string, unknown>;
  /** 개별 아이템의 control(라디오 원) props */
  getItemControlProps(itemProps: { value: string; disabled?: boolean }): Record<string, unknown>;
  /** 개별 아이템의 텍스트 props */
  getItemTextProps(itemProps: { value: string; disabled?: boolean }): Record<string, unknown>;
  /** 개별 아이템의 hidden input props */
  getItemHiddenInputProps(itemProps: {
    value: string;
    disabled?: boolean;
  }): Record<string, unknown>;
}

export function connect(
  state: RadioGroupState,
  context: RadioGroupContext,
  send: Send<RadioGroupEvent>,
  ids: { root: string; items: string[] },
): RadioGroupApi {
  const isDisabled = context.disabled;

  function isItemChecked(value: string): boolean {
    return context.value === value;
  }

  function isItemDisabled(itemDisabled?: boolean): boolean {
    return isDisabled || !!itemDisabled;
  }

  function isItemFocused(value: string): boolean {
    return context.focusedValue === value;
  }

  function getItemState(value: string): string {
    return isItemChecked(value) ? "checked" : "unchecked";
  }

  /**
   * WAI-ARIA roving tabindex:
   * - 선택된 아이템이 있으면 그 아이템만 tabindex=0
   * - 없으면 첫 번째 활성 아이템이 tabindex=0
   * - 나머지는 tabindex=-1
   */
  function getTabIndex(value: string, itemDisabled?: boolean): number {
    if (isItemDisabled(itemDisabled)) return -1;

    // 선택된 값이 있으면 선택된 아이템만 tab 가능
    if (context.value !== null) {
      return value === context.value ? 0 : -1;
    }

    // 선택된 값이 없으면 첫 번째 활성 아이템만 tab 가능
    const firstEnabledItem = ids.items[0];
    return value === firstEnabledItem ? 0 : -1;
  }

  return {
    value: context.value,
    isDisabled,

    setValue(value: string) {
      send({ type: "SET_VALUE", value });
    },

    getRootProps() {
      return {
        "data-scope": "radio-group",
        "data-part": "root",
        "data-orientation": context.orientation,
        "data-disabled": dataAttr(isDisabled),
        id: ids.root,
        role: "radiogroup",
        "aria-orientation": context.orientation,
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
        "aria-required": context.required ? ariaAttr(true) : undefined,
      };
    },

    getIndicatorProps() {
      return {
        "data-scope": "radio-group",
        "data-part": "indicator",
        "data-orientation": context.orientation,
        "data-disabled": dataAttr(isDisabled),
        "aria-hidden": "true" as const,
      };
    },

    getItemProps(itemProps) {
      const { value, disabled: itemDisabled } = itemProps;
      const checked = isItemChecked(value);
      const disabled = isItemDisabled(itemDisabled);
      const focused = isItemFocused(value);

      return {
        "data-scope": "radio-group",
        "data-part": "item",
        "data-state": getItemState(value),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-value": value,
        role: "radio",
        "aria-checked": ariaAttr(checked),
        "aria-disabled": disabled ? ariaAttr(true) : undefined,
        tabIndex: getTabIndex(value, itemDisabled),
        onFocus: composeEventHandlers(() => {
          if (!disabled) {
            send({ type: "FOCUS", value });
          }
        }),
        onBlur: composeEventHandlers(() => {
          send({ type: "BLUR" });
        }),
        onKeyDown: composeEventHandlers((event: KeyboardEvent) => {
          if (disabled) return;
          send({ type: "KEY_DOWN", key: event.key, items: ids.items });
          // 방향키, Space의 기본 스크롤 방지
          if (
            event.key === " " ||
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
          ) {
            event.preventDefault();
          }
        }),
        onClick: composeEventHandlers(() => {
          if (!disabled && !context.readOnly) {
            send({ type: "SET_VALUE", value });
          }
        }),
      };
    },

    getItemControlProps(itemProps) {
      const { value, disabled: itemDisabled } = itemProps;
      const checked = isItemChecked(value);
      const disabled = isItemDisabled(itemDisabled);

      return {
        "data-scope": "radio-group",
        "data-part": "itemControl",
        "data-state": getItemState(value),
        "data-disabled": dataAttr(disabled),
        "aria-hidden": "true" as const,
        "data-checked": dataAttr(checked),
      };
    },

    getItemTextProps(itemProps) {
      const { value, disabled: itemDisabled } = itemProps;
      const disabled = isItemDisabled(itemDisabled);

      return {
        "data-scope": "radio-group",
        "data-part": "itemText",
        "data-state": getItemState(value),
        "data-disabled": dataAttr(disabled),
      };
    },

    getItemHiddenInputProps(itemProps) {
      const { value, disabled: itemDisabled } = itemProps;
      const checked = isItemChecked(value);
      const disabled = isItemDisabled(itemDisabled);

      return {
        type: "radio" as const,
        "data-scope": "radio-group",
        "data-part": "itemHiddenInput",
        name: context.name,
        value,
        checked,
        disabled,
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
          if (!disabled && !context.readOnly) {
            send({ type: "SET_VALUE", value });
          }
        }),
      };
    },
  };
}
