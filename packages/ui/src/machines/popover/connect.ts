/**
 * Popover connect
 * 머신 상태를 WAI-ARIA Popover (non-modal) 패턴의 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { ariaAttr } from "@/machines/shared/dom";
import { Keys, isKey } from "@/machines/shared/keyboard";
import type { PopoverState, PopoverContext, PopoverEvent } from "./types";

export interface PopoverConnectReturn {
  /** 열림 상태 */
  isOpen: boolean;
  /** trigger 버튼 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": PopoverState;
    id: string;
    "aria-haspopup": "dialog";
    "aria-expanded": "true" | "false";
    "aria-controls": string;
    onClick: () => void;
  };
  /** positioner (정렬 래퍼) 속성 */
  positionerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": PopoverState;
    id: string;
  };
  /** content 영역 속성 */
  contentProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": PopoverState;
    id: string;
    role: "dialog";
    tabIndex: number;
    "aria-labelledby": string;
    "aria-describedby": string;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** title 속성 */
  titleProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** description 속성 */
  descriptionProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** closeTrigger 속성 */
  closeTriggerProps: {
    "data-scope": string;
    "data-part": string;
    type: "button";
    "aria-label": string;
    onClick: () => void;
  };
  /** arrow 속성 */
  arrowProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": PopoverState;
  };
}

export function connectPopover(
  state: PopoverState,
  context: PopoverContext,
  send: Send<PopoverEvent>,
): PopoverConnectReturn {
  const isOpen = state === "open";
  const triggerId = `${context.id}-trigger`;
  const positionerId = `${context.id}-positioner`;
  const contentId = `${context.id}-content`;
  const titleId = `${context.id}-title`;
  const descriptionId = `${context.id}-description`;

  return {
    isOpen,
    triggerProps: {
      "data-scope": "popover",
      "data-part": "trigger",
      "data-state": state,
      id: triggerId,
      "aria-haspopup": "dialog",
      "aria-expanded": ariaAttr(isOpen),
      "aria-controls": contentId,
      onClick() {
        send({ type: "TOGGLE" });
      },
    },
    positionerProps: {
      "data-scope": "popover",
      "data-part": "positioner",
      "data-state": state,
      id: positionerId,
    },
    contentProps: {
      "data-scope": "popover",
      "data-part": "content",
      "data-state": state,
      id: contentId,
      role: "dialog",
      tabIndex: -1,
      "aria-labelledby": titleId,
      "aria-describedby": descriptionId,
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.Escape)) {
          e.stopPropagation();
          send({ type: "CLOSE" });
        }
      },
    },
    titleProps: {
      "data-scope": "popover",
      "data-part": "title",
      id: titleId,
    },
    descriptionProps: {
      "data-scope": "popover",
      "data-part": "description",
      id: descriptionId,
    },
    closeTriggerProps: {
      "data-scope": "popover",
      "data-part": "close-trigger",
      type: "button",
      "aria-label": "Close",
      onClick() {
        send({ type: "CLOSE" });
      },
    },
    arrowProps: {
      "data-scope": "popover",
      "data-part": "arrow",
      "data-state": state,
    },
  };
}
