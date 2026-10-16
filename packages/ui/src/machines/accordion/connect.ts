/**
 * Accordion connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { AccordionState, AccordionContext, AccordionEvent } from "./types";
import { SCOPE, accordionAnatomy } from "./anatomy";

function getTriggerId(ctx: AccordionContext, value: string): string {
  return `${ctx.id}:trigger:${value}`;
}

function getContentId(ctx: AccordionContext, value: string): string {
  return `${ctx.id}:content:${value}`;
}

export function connect(state: AccordionState, ctx: AccordionContext, send: Send<AccordionEvent>) {
  return {
    /** 현재 열려있는 아이템 값 목록 */
    value: ctx.value,

    /** 값 설정 */
    setValue(value: string[]) {
      send({ type: "SET_VALUE", value });
    },

    /** Root 속성 */
    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": accordionAnatomy.root,
        "data-orientation": ctx.orientation,
      } as const;
    },

    /** 개별 아이템 래퍼 속성 */
    getItemProps(props: { value: string; disabled?: boolean }) {
      const isOpen = ctx.value.includes(props.value);
      const isDisabled = props.disabled ?? false;

      return {
        "data-scope": SCOPE,
        "data-part": accordionAnatomy.item,
        "data-state": isOpen ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": ctx.orientation,
      };
    },

    /** 아이템 트리거(버튼) 속성 */
    getItemTriggerProps(props: { value: string; disabled?: boolean }) {
      const isOpen = ctx.value.includes(props.value);
      const isDisabled = props.disabled ?? false;
      const triggerId = getTriggerId(ctx, props.value);
      const contentId = getContentId(ctx, props.value);

      return {
        id: triggerId,
        type: "button" as const,
        "aria-expanded": ariaAttr(isOpen),
        "aria-controls": contentId,
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
        disabled: isDisabled,
        "data-scope": SCOPE,
        "data-part": accordionAnatomy.itemTrigger,
        "data-state": isOpen ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": ctx.orientation,
        onClick() {
          if (!isDisabled) {
            send({ type: "ITEM_TOGGLE", value: props.value });
          }
        },
        onFocus() {
          if (!isDisabled) {
            send({ type: "TRIGGER_FOCUS", value: props.value });
          }
        },
        onKeyDown(e: React.KeyboardEvent) {
          if (isDisabled) return;
          const handled = ["ArrowUp", "ArrowDown", "Home", "End", " ", "Enter"];
          if (handled.includes(e.key)) {
            e.preventDefault();
            send({ type: "KEY_DOWN", key: e.key });
          }
        },
      };
    },

    /** 아이템 콘텐츠 속성 */
    getItemContentProps(props: { value: string }) {
      const isOpen = ctx.value.includes(props.value);
      const triggerId = getTriggerId(ctx, props.value);
      const contentId = getContentId(ctx, props.value);

      return {
        id: contentId,
        role: "region" as const,
        "aria-labelledby": triggerId,
        hidden: !isOpen,
        "data-scope": SCOPE,
        "data-part": accordionAnatomy.itemContent,
        "data-state": isOpen ? "open" : "closed",
        "data-orientation": ctx.orientation,
      };
    },

    /** 아이템 인디케이터 (화살표/아이콘 등) 속성 */
    getItemIndicatorProps(props: { value: string }) {
      const isOpen = ctx.value.includes(props.value);

      return {
        "data-scope": SCOPE,
        "data-part": accordionAnatomy.itemIndicator,
        "data-state": isOpen ? "open" : "closed",
        "data-orientation": ctx.orientation,
        "aria-hidden": "true" as const,
      };
    },
  };
}
