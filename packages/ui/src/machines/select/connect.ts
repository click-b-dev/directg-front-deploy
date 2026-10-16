/**
 * Select connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { SelectState, SelectContext, SelectEvent } from "./types";
import { SCOPE, selectAnatomy } from "./anatomy";

function getTriggerId(ctx: SelectContext): string {
  return `${ctx.id}:trigger`;
}

function getContentId(ctx: SelectContext): string {
  return `${ctx.id}:content`;
}

function getLabelId(ctx: SelectContext): string {
  return `${ctx.id}:label`;
}

function getOptionId(ctx: SelectContext, index: number): string {
  return `${ctx.id}:option:${index}`;
}

export function connect(state: SelectState, ctx: SelectContext, send: Send<SelectEvent>) {
  const isOpen = state === "open";
  const hasValue = ctx.value !== "";

  return {
    /** 현재 선택된 값 */
    value: ctx.value,

    /** 현재 선택된 아이템의 레이블 */
    valueLabel: ctx.valueLabel,

    /** 열림 상태 */
    open: isOpen,

    /** 하이라이트된 아이템 인덱스 */
    highlightedIndex: ctx.highlightedIndex,

    /** 값 설정 */
    setValue(value: string) {
      send({ type: "SET_VALUE", value });
    },

    /** 닫기 */
    close() {
      send({ type: "CLOSE" });
    },

    /** Root 속성 */
    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": selectAnatomy.root,
        "data-state": isOpen ? "open" : "closed",
      } as const;
    },

    /** Label 속성 */
    getLabelProps() {
      return {
        id: getLabelId(ctx),
        "data-scope": SCOPE,
        "data-part": selectAnatomy.label,
        htmlFor: getTriggerId(ctx),
      };
    },

    /** Trigger 버튼 속성 */
    getTriggerProps() {
      return {
        id: getTriggerId(ctx),
        role: "combobox" as const,
        type: "button" as const,
        "aria-expanded": ariaAttr(isOpen),
        "aria-haspopup": "listbox" as const,
        "aria-controls": getContentId(ctx),
        "aria-labelledby": getLabelId(ctx),
        "aria-activedescendant":
          isOpen && ctx.highlightedIndex >= 0 ? getOptionId(ctx, ctx.highlightedIndex) : undefined,
        "data-scope": SCOPE,
        "data-part": selectAnatomy.trigger,
        "data-state": isOpen ? "open" : "closed",
        "data-placeholder-shown": dataAttr(!hasValue),
        onClick() {
          send({ type: "TRIGGER_CLICK" });
        },
        onKeyDown(e: React.KeyboardEvent) {
          const handled = ["Enter", " ", "ArrowDown", "ArrowUp"];
          if (handled.includes(e.key)) {
            e.preventDefault();
          }
          send({ type: "TRIGGER_KEY_DOWN", key: e.key });

          // type-ahead 타이머 (300ms 후 버퍼 초기화)
          if (e.key.length === 1 && e.key !== " ") {
            clearTypeaheadTimer(send);
          }
        },
      };
    },

    /** Positioner (위치 지정 래퍼) 속성 */
    getPositionerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": selectAnatomy.positioner,
        "data-state": isOpen ? "open" : "closed",
      };
    },

    /** Content (listbox) 속성 */
    getContentProps() {
      return {
        id: getContentId(ctx),
        role: "listbox" as const,
        tabIndex: 0,
        "aria-labelledby": getLabelId(ctx),
        "aria-activedescendant":
          ctx.highlightedIndex >= 0 ? getOptionId(ctx, ctx.highlightedIndex) : undefined,
        hidden: !isOpen,
        "data-scope": SCOPE,
        "data-part": selectAnatomy.content,
        "data-state": isOpen ? "open" : "closed",
        onKeyDown(e: React.KeyboardEvent) {
          const handled = ["Enter", " ", "ArrowDown", "ArrowUp", "Home", "End", "Escape"];
          if (handled.includes(e.key)) {
            e.preventDefault();
          }
          send({ type: "CONTENT_KEY_DOWN", key: e.key });

          // type-ahead 타이머
          if (e.key.length === 1 && e.key !== " ") {
            clearTypeaheadTimer(send);
          }
        },
      };
    },

    /** 개별 옵션 아이템 속성 */
    getItemProps(props: { value: string; index: number; disabled?: boolean }) {
      const isSelected = ctx.value === props.value;
      const isHighlighted = ctx.highlightedIndex === props.index;
      const isDisabled = props.disabled ?? false;

      return {
        id: getOptionId(ctx, props.index),
        role: "option" as const,
        "aria-selected": ariaAttr(isSelected),
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
        "data-scope": SCOPE,
        "data-part": selectAnatomy.item,
        "data-state": isSelected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(isHighlighted),
        "data-disabled": dataAttr(isDisabled),
        "data-value": props.value,
        onClick() {
          if (!isDisabled) {
            send({ type: "OPTION_CLICK", value: props.value });
          }
        },
        onPointerMove() {
          if (!isDisabled) {
            send({ type: "OPTION_HOVER", index: props.index });
          }
        },
      };
    },

    /** 아이템 텍스트 속성 */
    getItemTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": selectAnatomy.itemText,
      };
    },

    /** 아이템 선택 인디케이터 (체크 등) 속성 */
    getItemIndicatorProps(props: { value: string }) {
      const isSelected = ctx.value === props.value;
      return {
        "aria-hidden": "true" as const,
        hidden: !isSelected,
        "data-scope": SCOPE,
        "data-part": selectAnatomy.itemIndicator,
        "data-state": isSelected ? "checked" : "unchecked",
      };
    },

    /** 값 텍스트 표시 영역 속성 */
    getValueTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": selectAnatomy.valueText,
        "data-placeholder-shown": dataAttr(!hasValue),
      };
    },

    /** 숨겨진 native select (폼 전송용) 속성 */
    getHiddenSelectProps(props: { name?: string }) {
      return {
        name: props.name,
        "aria-hidden": "true" as const,
        tabIndex: -1,
        value: ctx.value,
        "data-scope": SCOPE,
        "data-part": selectAnatomy.hiddenSelect,
        style: {
          position: "absolute" as const,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap" as const,
          border: "0",
        },
      };
    },
  };
}

/** type-ahead 타이머: 300ms 후 버퍼 초기화 */
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

function clearTypeaheadTimer(send: Send<SelectEvent>) {
  if (typeaheadTimer) clearTimeout(typeaheadTimer);
  typeaheadTimer = setTimeout(() => {
    send({ type: "CLEAR_TYPEAHEAD" });
    typeaheadTimer = null;
  }, 300);
}
