import { dataAttr, ariaAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { NavigationMenuState, NavigationMenuContext, NavigationMenuEvent } from "./types";
import { SCOPE, navigationMenuAnatomy } from "./anatomy";

function getTriggerId(ctx: NavigationMenuContext, value: string): string {
  return `${ctx.id}:trigger:${value}`;
}

function getContentId(ctx: NavigationMenuContext, value: string): string {
  return `${ctx.id}:content:${value}`;
}

export interface NavigationMenuApi {
  /** 현재 열려 있는 메뉴 값 */
  value: string | null;
  /** 메뉴가 열려 있는지 여부 */
  isOpen: boolean;

  /** 값 설정 */
  setValue(value: string | null): void;

  getRootProps(): Record<string, unknown>;
  getListProps(): Record<string, unknown>;
  getItemProps(props: { value: string }): Record<string, unknown>;
  getTriggerProps(props: { value: string; disabled?: boolean }): Record<string, unknown>;
  getContentProps(props: { value: string }): Record<string, unknown>;
  getLinkProps(props: { active?: boolean }): Record<string, unknown>;
  getIndicatorProps(): Record<string, unknown>;
  getViewportProps(): Record<string, unknown>;
  getArrowProps(): Record<string, unknown>;
}

export function connect(
  state: NavigationMenuState,
  ctx: NavigationMenuContext,
  send: Send<NavigationMenuEvent>,
): NavigationMenuApi {
  const isOpen = state === "open";

  return {
    value: ctx.value,
    isOpen,

    setValue(value: string | null) {
      send({ type: "SET_VALUE", value });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.root,
        "data-orientation": ctx.orientation,
        "data-state": isOpen ? "open" : "closed",
        role: "navigation",
      };
    },

    getListProps() {
      return {
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.list,
        "data-orientation": ctx.orientation,
        role: "menubar",
        "aria-orientation": ctx.orientation,
        onKeyDown(e: React.KeyboardEvent) {
          send({ type: "KEY_DOWN", key: e.key });
          if (
            e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "Home" ||
            e.key === "End" ||
            e.key === " " ||
            e.key === "Escape"
          ) {
            e.preventDefault();
          }
        },
      };
    },

    getItemProps(props) {
      const isItemOpen = ctx.value === props.value;

      return {
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.item,
        "data-state": isItemOpen ? "open" : "closed",
        "data-value": props.value,
        role: "none",
      };
    },

    getTriggerProps(props) {
      const { value, disabled = false } = props;
      const isItemOpen = ctx.value === value;
      const triggerId = getTriggerId(ctx, value);
      const contentId = getContentId(ctx, value);
      const enabledItems = ctx.items.filter((i) => !i.disabled);
      const itemIdx = enabledItems.findIndex((i) => i.value === value);
      const isFocused = ctx.focusedIndex === itemIdx;

      return {
        id: triggerId,
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.trigger,
        "data-state": isItemOpen ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-value": value,
        role: "menuitem",
        "aria-expanded": ariaAttr(isItemOpen),
        "aria-controls": isItemOpen ? contentId : undefined,
        "aria-disabled": disabled ? ariaAttr(true) : undefined,
        tabIndex: isFocused ? 0 : -1,
        disabled,
        onMouseEnter() {
          if (!disabled) {
            send({ type: "TRIGGER_HOVER", value });
          }
        },
        onMouseLeave() {
          send({ type: "TRIGGER_LEAVE" });
        },
        onClick() {
          if (!disabled) {
            send({ type: "TRIGGER_CLICK", value });
          }
        },
        onFocus() {
          if (!disabled) {
            send({ type: "FOCUS_TRIGGER", value });
          }
        },
      };
    },

    getContentProps(props) {
      const { value } = props;
      const isItemOpen = ctx.value === value;
      const triggerId = getTriggerId(ctx, value);
      const contentId = getContentId(ctx, value);

      return {
        id: contentId,
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.content,
        "data-state": isItemOpen ? "open" : "closed",
        "data-value": value,
        role: "menu",
        "aria-labelledby": triggerId,
        hidden: !isItemOpen,
        onMouseEnter() {
          send({ type: "CONTENT_HOVER" });
        },
        onMouseLeave() {
          send({ type: "CONTENT_LEAVE" });
        },
        onKeyDown(e: React.KeyboardEvent) {
          if (e.key === "Escape") {
            e.preventDefault();
            send({ type: "ESCAPE" });
          }
        },
      };
    },

    getLinkProps(props) {
      const { active = false } = props;

      return {
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.link,
        "data-active": dataAttr(active),
        role: "menuitem",
      };
    },

    getIndicatorProps() {
      return {
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.indicator,
        "data-state": isOpen ? "open" : "closed",
        "data-orientation": ctx.orientation,
        "aria-hidden": "true" as const,
      };
    },

    getViewportProps() {
      return {
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.viewport,
        "data-state": isOpen ? "open" : "closed",
        "data-orientation": ctx.orientation,
      };
    },

    getArrowProps() {
      return {
        "data-scope": SCOPE,
        "data-part": navigationMenuAnatomy.arrow,
        "data-state": isOpen ? "open" : "closed",
        "aria-hidden": "true" as const,
      };
    },
  };
}
