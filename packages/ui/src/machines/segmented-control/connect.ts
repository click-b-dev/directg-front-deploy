import type { Send } from "@/machines/shared/types";
import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import type {
  SegmentedControlState,
  SegmentedControlContext,
  SegmentedControlEvent,
} from "./types";

export interface SegmentedControlApi {
  /** 현재 선택된 값 */
  value: string | null;
  /** disabled 상태인지 여부 */
  isDisabled: boolean;

  /** 선택된 값을 설정 */
  setValue(value: string): void;

  /** root 요소 props */
  getRootProps(): Record<string, unknown>;
  /** indicator 요소 props */
  getIndicatorProps(): Record<string, unknown>;
  /** 개별 아이템 props */
  getItemProps(itemProps: { value: string; disabled?: boolean }): Record<string, unknown>;
  /** 개별 아이템의 텍스트 props */
  getItemTextProps(itemProps: { value: string }): Record<string, unknown>;
  /** 개별 아이템의 hidden input props */
  getItemHiddenInputProps(itemProps: {
    value: string;
    disabled?: boolean;
  }): Record<string, unknown>;
}

export function connect(
  _state: SegmentedControlState,
  context: SegmentedControlContext,
  send: Send<SegmentedControlEvent>,
  ids: { root: string; items: string[] },
): SegmentedControlApi {
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

  function getTabIndex(value: string, itemDisabled?: boolean): number {
    if (isItemDisabled(itemDisabled)) return -1;
    if (context.value !== null) {
      return value === context.value ? 0 : -1;
    }
    const firstItem = ids.items[0];
    return value === firstItem ? 0 : -1;
  }

  return {
    value: context.value,
    isDisabled,

    setValue(value: string) {
      send({ type: "SET_VALUE", value });
    },

    getRootProps() {
      return {
        "data-scope": "segmented-control",
        "data-part": "root",
        "data-orientation": context.orientation,
        "data-disabled": dataAttr(isDisabled),
        id: ids.root,
        role: "radiogroup",
        "aria-orientation": context.orientation,
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
      };
    },

    getIndicatorProps() {
      return {
        "data-scope": "segmented-control",
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
        "data-scope": "segmented-control",
        "data-part": "item",
        "data-state": checked ? "checked" : "unchecked",
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-value": value,
        id: `${value}-segment`,
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
          if (
            event.key === " " ||
            event.key === "Enter" ||
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "Home" ||
            event.key === "End"
          ) {
            event.preventDefault();
          }
        }),
        onClick: composeEventHandlers(() => {
          if (!disabled) {
            send({ type: "SET_VALUE", value });
          }
        }),
      };
    },

    getItemTextProps(itemProps) {
      const { value } = itemProps;

      return {
        "data-scope": "segmented-control",
        "data-part": "itemText",
        "data-state": isItemChecked(value) ? "checked" : "unchecked",
      };
    },

    getItemHiddenInputProps(itemProps) {
      const { value, disabled: itemDisabled } = itemProps;
      const checked = isItemChecked(value);
      const disabled = isItemDisabled(itemDisabled);

      return {
        type: "radio" as const,
        "data-scope": "segmented-control",
        "data-part": "itemHiddenInput",
        name: context.name,
        value,
        checked,
        disabled,
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
          if (!disabled) {
            send({ type: "SET_VALUE", value });
          }
        }),
      };
    },
  };
}
