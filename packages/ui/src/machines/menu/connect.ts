/**
 * Menu connect
 * 머신 상태를 WAI-ARIA Menu + MenuButton 패턴의 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { dataAttr, ariaAttr } from "@/machines/shared/dom";
import { Keys, isKey, isPrintableKey } from "@/machines/shared/keyboard";
import type { MenuState, MenuContext, MenuEvent } from "./types";

export interface MenuConnectReturn {
  /** 열림 상태 */
  isOpen: boolean;
  /** 현재 하이라이트된 아이템 ID */
  highlightedId: string | null;
  /** trigger 버튼 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": MenuState;
    id: string;
    "aria-haspopup": "menu";
    "aria-expanded": "true" | "false";
    "aria-controls": string;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** positioner (정렬 래퍼) 속성 */
  positionerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": MenuState;
    id: string;
  };
  /** content 영역 속성 */
  contentProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": MenuState;
    id: string;
    role: "menu";
    "aria-orientation": "horizontal" | "vertical";
    "aria-labelledby": string;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** 개별 아이템 속성을 생성하는 함수 */
  getItemProps: (options: { id: string; disabled?: boolean; onSelect?: () => void }) => {
    "data-scope": string;
    "data-part": string;
    "data-highlighted": "" | undefined;
    "data-disabled": "" | undefined;
    id: string;
    role: "menuitem";
    tabIndex: number;
    "aria-disabled": "true" | undefined;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onClick: (e: React.MouseEvent) => void;
  };
  /** itemGroupLabel 속성 */
  getItemGroupLabelProps: (options: { htmlFor: string }) => {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** separator 속성 */
  separatorProps: {
    "data-scope": string;
    "data-part": string;
    role: "separator";
    "aria-orientation": "horizontal" | "vertical";
  };
  /** itemGroup 속성 */
  getItemGroupProps: (options: { id: string }) => {
    "data-scope": string;
    "data-part": string;
    id: string;
    role: "group";
    "aria-labelledby": string;
  };
}

export function connectMenu(
  state: MenuState,
  context: MenuContext,
  send: Send<MenuEvent>,
): MenuConnectReturn {
  const isOpen = state === "open";
  const triggerId = `${context.id}-trigger`;
  const positionerId = `${context.id}-positioner`;
  const contentId = `${context.id}-content`;

  return {
    isOpen,
    highlightedId: context.highlightedId,
    triggerProps: {
      "data-scope": "menu",
      "data-part": "trigger",
      "data-state": state,
      id: triggerId,
      "aria-haspopup": "menu",
      "aria-expanded": ariaAttr(isOpen),
      "aria-controls": contentId,
      onClick() {
        send({ type: "TOGGLE" });
      },
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.ArrowDown)) {
          e.preventDefault();
          send({ type: "OPEN_AND_HIGHLIGHT_FIRST" });
        } else if (isKey(e.key, Keys.ArrowUp)) {
          e.preventDefault();
          send({ type: "OPEN_AND_HIGHLIGHT_LAST" });
        } else if (isKey(e.key, Keys.Enter, Keys.Space)) {
          e.preventDefault();
          send({ type: "TOGGLE" });
        }
      },
    },
    positionerProps: {
      "data-scope": "menu",
      "data-part": "positioner",
      "data-state": state,
      id: positionerId,
    },
    contentProps: {
      "data-scope": "menu",
      "data-part": "content",
      "data-state": state,
      id: contentId,
      role: "menu",
      "aria-orientation": context.orientation,
      "aria-labelledby": triggerId,
      tabIndex: -1,
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.Escape)) {
          e.preventDefault();
          e.stopPropagation();
          send({ type: "CLOSE" });
          // 포커스를 trigger로 복원
          document.getElementById(triggerId)?.focus();
          return;
        }

        if (isKey(e.key, Keys.ArrowDown)) {
          e.preventDefault();
          send({ type: "HIGHLIGHT_NEXT" });
          return;
        }

        if (isKey(e.key, Keys.ArrowUp)) {
          e.preventDefault();
          send({ type: "HIGHLIGHT_PREV" });
          return;
        }

        if (isKey(e.key, Keys.Home)) {
          e.preventDefault();
          send({ type: "HIGHLIGHT_FIRST" });
          return;
        }

        if (isKey(e.key, Keys.End)) {
          e.preventDefault();
          send({ type: "HIGHLIGHT_LAST" });
          return;
        }

        if (isKey(e.key, Keys.Enter, Keys.Space)) {
          e.preventDefault();
          if (context.highlightedId) {
            send({ type: "SELECT_HIGHLIGHTED" });
            document.getElementById(triggerId)?.focus();
          }
          return;
        }

        // Type-ahead
        if (isPrintableKey(e.key)) {
          e.preventDefault();
          send({ type: "TYPEAHEAD", key: e.key });
        }
      },
    },
    getItemProps(options) {
      const { id, disabled = false, onSelect } = options;
      const isHighlighted = context.highlightedId === id;

      return {
        "data-scope": "menu",
        "data-part": "item",
        "data-highlighted": dataAttr(isHighlighted),
        "data-disabled": dataAttr(disabled),
        id,
        role: "menuitem",
        tabIndex: isHighlighted ? 0 : -1,
        "aria-disabled": disabled ? ("true" as const) : undefined,
        onPointerEnter() {
          if (!disabled) {
            send({ type: "HIGHLIGHT", id });
          }
        },
        onPointerLeave() {
          send({ type: "HIGHLIGHT", id: null });
        },
        onClick(e: React.MouseEvent) {
          if (disabled) {
            e.preventDefault();
            return;
          }
          onSelect?.();
          send({ type: "CLOSE" });
          document.getElementById(triggerId)?.focus();
        },
      };
    },
    getItemGroupLabelProps(options) {
      return {
        "data-scope": "menu",
        "data-part": "item-group-label",
        id: options.htmlFor,
      };
    },
    separatorProps: {
      "data-scope": "menu",
      "data-part": "separator",
      role: "separator",
      "aria-orientation": context.orientation === "horizontal" ? "vertical" : "horizontal",
    },
    getItemGroupProps(options) {
      return {
        "data-scope": "menu",
        "data-part": "item-group",
        id: options.id,
        role: "group",
        "aria-labelledby": `${options.id}-label`,
      };
    },
  };
}
