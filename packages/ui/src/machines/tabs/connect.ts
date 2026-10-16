/**
 * Tabs connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { TabsState, TabsContext, TabsEvent } from "./types";
import { SCOPE, tabsAnatomy } from "./anatomy";

function getTriggerId(ctx: TabsContext, value: string): string {
  return `${ctx.id}:trigger:${value}`;
}

function getContentId(ctx: TabsContext, value: string): string {
  return `${ctx.id}:content:${value}`;
}

export function connect(state: TabsState, ctx: TabsContext, send: Send<TabsEvent>) {
  return {
    /** 현재 활성 탭 값 */
    value: ctx.value,

    /** 방향 */
    orientation: ctx.orientation,

    /** 값 설정 */
    setValue(value: string) {
      send({ type: "SET_VALUE", value });
    },

    /** Root 속성 */
    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tabsAnatomy.root,
        "data-orientation": ctx.orientation,
      } as const;
    },

    /** Tab list 속성 */
    getListProps() {
      return {
        role: "tablist" as const,
        "aria-orientation": ctx.orientation,
        "data-scope": SCOPE,
        "data-part": tabsAnatomy.list,
        "data-orientation": ctx.orientation,
        onKeyDown(e: React.KeyboardEvent) {
          send({ type: "KEY_DOWN", key: e.key });
          if (
            e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "Home" ||
            e.key === "End" ||
            e.key === " "
          ) {
            e.preventDefault();
          }
        },
      };
    },

    /** 개별 탭 trigger 속성 */
    getTriggerProps(props: { value: string; disabled?: boolean }) {
      const isSelected = ctx.value === props.value;
      const isDisabled = props.disabled ?? false;
      const triggerId = getTriggerId(ctx, props.value);
      const contentId = getContentId(ctx, props.value);

      return {
        id: triggerId,
        role: "tab" as const,
        type: "button" as const,
        tabIndex: isSelected ? 0 : -1,
        "aria-selected": ariaAttr(isSelected),
        "aria-controls": contentId,
        "aria-disabled": isDisabled ? ariaAttr(true) : undefined,
        disabled: isDisabled,
        "data-scope": SCOPE,
        "data-part": tabsAnatomy.trigger,
        "data-state": isSelected ? "active" : "inactive",
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": ctx.orientation,
        "data-value": props.value,
        onClick() {
          if (!isDisabled) {
            send({ type: "TAB_CLICK", value: props.value });
          }
        },
        onFocus() {
          if (!isDisabled) {
            send({ type: "TAB_FOCUS", value: props.value });
          }
        },
      };
    },

    /** 탭 패널 속성 */
    getContentProps(props: { value: string }) {
      const isSelected = ctx.value === props.value;
      const triggerId = getTriggerId(ctx, props.value);
      const contentId = getContentId(ctx, props.value);

      return {
        id: contentId,
        role: "tabpanel" as const,
        tabIndex: 0,
        "aria-labelledby": triggerId,
        hidden: !isSelected,
        "data-scope": SCOPE,
        "data-part": tabsAnatomy.content,
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": ctx.orientation,
      };
    },

    /** 인디케이터 속성 (선택적: 애니메이션 바 등에 사용) */
    getIndicatorProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tabsAnatomy.indicator,
        "data-orientation": ctx.orientation,
      };
    },
  };
}
