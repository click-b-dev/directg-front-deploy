/**
 * Combobox connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { ComboboxState, ComboboxContext, ComboboxEvent } from "./types";
import { SCOPE, comboboxAnatomy } from "./anatomy";

function getInputId(ctx: ComboboxContext): string {
  return `${ctx.id}:input`;
}

function getContentId(ctx: ComboboxContext): string {
  return `${ctx.id}:content`;
}

function getLabelId(ctx: ComboboxContext): string {
  return `${ctx.id}:label`;
}

function getControlId(ctx: ComboboxContext): string {
  return `${ctx.id}:control`;
}

function getTriggerId(ctx: ComboboxContext): string {
  return `${ctx.id}:trigger`;
}

function getItemId(ctx: ComboboxContext, value: string): string {
  return `${ctx.id}:item:${value}`;
}

export function connect(state: ComboboxState, ctx: ComboboxContext, send: Send<ComboboxEvent>) {
  const isOpen = state === "open";
  const hasValue = ctx.value.length > 0;
  const isDisabled = ctx.disabled;
  const isReadOnly = ctx.readOnly;

  return {
    /** 현재 선택된 값 */
    value: ctx.value,

    /** 현재 입력 텍스트 */
    inputValue: ctx.inputValue,

    /** 하이라이트된 아이템 값 */
    highlightedValue: ctx.highlightedValue,

    /** 열림 상태 */
    open: isOpen,

    /** 필터된 아이템 */
    filteredItems: ctx.filteredItems,

    /** 값 설정 */
    setValue(value: string[]) {
      send({ type: "SET_VALUE", value });
    },

    /** 입력값 설정 */
    setInputValue(value: string) {
      send({ type: "SET_INPUT_VALUE", value });
    },

    /** 닫기 */
    close() {
      send({ type: "CLOSE" });
    },

    /** Root 속성 */
    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.root,
        "data-state": isOpen ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(isReadOnly),
      };
    },

    /** Label 속성 */
    getLabelProps() {
      return {
        id: getLabelId(ctx),
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.label,
        htmlFor: getInputId(ctx),
      };
    },

    /** Control (input + trigger 래퍼) 속성 */
    getControlProps() {
      return {
        id: getControlId(ctx),
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.control,
        "data-state": isOpen ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
      };
    },

    /** Input 속성 */
    getInputProps() {
      return {
        id: getInputId(ctx),
        type: "text" as const,
        role: "combobox" as const,
        "aria-expanded": ariaAttr(isOpen),
        "aria-haspopup": "listbox" as const,
        "aria-controls": isOpen ? getContentId(ctx) : undefined,
        "aria-labelledby": getLabelId(ctx),
        "aria-autocomplete": ctx.autoComplete,
        "aria-activedescendant":
          isOpen && ctx.highlightedValue ? getItemId(ctx, ctx.highlightedValue) : undefined,
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
        "aria-readonly": isReadOnly ? ariaAttr(true) : undefined,
        autoComplete: "off" as const,
        disabled: isDisabled,
        readOnly: isReadOnly,
        value: ctx.inputValue,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.input,
        "data-state": isOpen ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        onChange(e: React.ChangeEvent<HTMLInputElement>) {
          send({ type: "INPUT_CHANGE", value: e.target.value });
        },
        onFocus() {
          send({ type: "INPUT_FOCUS" });
        },
        onBlur() {
          // Delay blur to allow item click to fire first
          setTimeout(() => {
            send({ type: "INPUT_BLUR" });
          }, 150);
        },
        onKeyDown(e: React.KeyboardEvent) {
          const handled = ["ArrowDown", "ArrowUp", "Home", "End", "Enter", "Escape"];
          if (handled.includes(e.key)) {
            e.preventDefault();
          }
          send({ type: "INPUT_KEY_DOWN", key: e.key });
        },
      };
    },

    /** Trigger (dropdown 토글 버튼) 속성 */
    getTriggerProps() {
      return {
        id: getTriggerId(ctx),
        type: "button" as const,
        tabIndex: -1,
        "aria-label": "Toggle suggestions",
        "aria-expanded": ariaAttr(isOpen),
        "aria-controls": getContentId(ctx),
        "aria-haspopup": "listbox" as const,
        disabled: isDisabled,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.trigger,
        "data-state": isOpen ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        onClick() {
          send({ type: "TRIGGER_CLICK" });
        },
      };
    },

    /** Clear 버튼 속성 */
    getClearTriggerProps() {
      return {
        type: "button" as const,
        tabIndex: -1,
        "aria-label": "Clear selection",
        hidden: !hasValue && ctx.inputValue === "",
        disabled: isDisabled,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.clearTrigger,
        "data-disabled": dataAttr(isDisabled),
        onClick() {
          send({ type: "CLEAR_CLICK" });
        },
      };
    },

    /** Positioner 속성 */
    getPositionerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.positioner,
        "data-state": isOpen ? "open" : "closed",
      };
    },

    /** Content (listbox) 속성 */
    getContentProps() {
      return {
        id: getContentId(ctx),
        role: "listbox" as const,
        "aria-labelledby": getLabelId(ctx),
        hidden: !isOpen,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.content,
        "data-state": isOpen ? "open" : "closed",
      };
    },

    /** 개별 아이템 속성 */
    getItemProps(props: { value: string; disabled?: boolean }) {
      const isSelected = ctx.value.includes(props.value);
      const isHighlighted = ctx.highlightedValue === props.value;
      const isItemDisabled = props.disabled ?? false;

      return {
        id: getItemId(ctx, props.value),
        role: "option" as const,
        "aria-selected": ariaAttr(isSelected),
        "aria-disabled": isItemDisabled ? ariaAttr(true) : undefined,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.item,
        "data-state": isSelected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(isHighlighted),
        "data-disabled": dataAttr(isItemDisabled),
        "data-value": props.value,
        onClick() {
          if (!isItemDisabled) {
            send({ type: "ITEM_CLICK", value: props.value });
          }
        },
        onPointerMove() {
          if (!isItemDisabled) {
            send({ type: "ITEM_HOVER", value: props.value });
          }
        },
      };
    },

    /** 아이템 텍스트 속성 */
    getItemTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.itemText,
      };
    },

    /** 아이템 인디케이터 속성 */
    getItemIndicatorProps(props: { value: string }) {
      const isSelected = ctx.value.includes(props.value);
      return {
        "aria-hidden": "true" as const,
        hidden: !isSelected,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.itemIndicator,
        "data-state": isSelected ? "checked" : "unchecked",
      };
    },

    /** 아이템 그룹 속성 */
    getItemGroupProps(props: { id: string }) {
      return {
        role: "group" as const,
        "aria-labelledby": `${ctx.id}:group:${props.id}`,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.itemGroup,
      };
    },

    /** 아이템 그룹 레이블 속성 */
    getItemGroupLabelProps(props: { htmlFor: string }) {
      return {
        id: `${ctx.id}:group:${props.htmlFor}`,
        role: "presentation" as const,
        "data-scope": SCOPE,
        "data-part": comboboxAnatomy.itemGroupLabel,
      };
    },
  };
}
