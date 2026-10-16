/**
 * HoverCard connect
 * 머신 상태를 HoverCard 패턴의 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { Keys, isKey } from "@/machines/shared/keyboard";
import type { HoverCardState, HoverCardContext, HoverCardEvent } from "./types";

export interface HoverCardConnectReturn {
  /** 열림 상태 */
  isOpen: boolean;
  /** trigger 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": HoverCardState;
    id: string;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
  /** positioner (정렬 래퍼) 속성 */
  positionerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": HoverCardState;
    id: string;
  };
  /** content 영역 속성 */
  contentProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": HoverCardState;
    id: string;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** arrow 속성 */
  arrowProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": HoverCardState;
  };
}

export function connectHoverCard(
  state: HoverCardState,
  context: HoverCardContext,
  send: Send<HoverCardEvent>,
): HoverCardConnectReturn {
  const isOpen = state === "open" || state === "closing";
  const triggerId = `${context.id}-trigger`;
  const positionerId = `${context.id}-positioner`;
  const contentId = `${context.id}-content`;

  return {
    isOpen,
    triggerProps: {
      "data-scope": "hover-card",
      "data-part": "trigger",
      "data-state": state,
      id: triggerId,
      onPointerEnter() {
        send({ type: "POINTER_ENTER" });
      },
      onPointerLeave() {
        send({ type: "POINTER_LEAVE" });
      },
    },
    positionerProps: {
      "data-scope": "hover-card",
      "data-part": "positioner",
      "data-state": state,
      id: positionerId,
    },
    contentProps: {
      "data-scope": "hover-card",
      "data-part": "content",
      "data-state": state,
      id: contentId,
      onPointerEnter() {
        send({ type: "CONTENT_POINTER_ENTER" });
      },
      onPointerLeave() {
        send({ type: "CONTENT_POINTER_LEAVE" });
      },
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.Escape)) {
          send({ type: "ESCAPE" });
        }
      },
    },
    arrowProps: {
      "data-scope": "hover-card",
      "data-part": "arrow",
      "data-state": state,
    },
  };
}
