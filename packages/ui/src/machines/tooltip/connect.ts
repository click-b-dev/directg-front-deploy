/**
 * Tooltip connect
 * 머신 상태를 WAI-ARIA Tooltip 패턴의 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { Keys, isKey } from "@/machines/shared/keyboard";
import type { TooltipState, TooltipContext, TooltipEvent } from "./types";

export interface TooltipConnectReturn {
  /** 열림 상태 */
  isOpen: boolean;
  /** trigger 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": TooltipState;
    id: string;
    "aria-describedby": string | undefined;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** positioner (정렬 래퍼) 속성 */
  positionerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": TooltipState;
    id: string;
  };
  /** content 영역 속성 */
  contentProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": TooltipState;
    id: string;
    role: "tooltip";
  };
  /** arrow 속성 */
  arrowProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": TooltipState;
  };
}

export function connectTooltip(
  state: TooltipState,
  context: TooltipContext,
  send: Send<TooltipEvent>,
): TooltipConnectReturn {
  const isOpen = state === "open" || state === "closing";
  const triggerId = `${context.id}-trigger`;
  const positionerId = `${context.id}-positioner`;
  const contentId = `${context.id}-content`;

  return {
    isOpen,
    triggerProps: {
      "data-scope": "tooltip",
      "data-part": "trigger",
      "data-state": state,
      id: triggerId,
      "aria-describedby": isOpen ? contentId : undefined,
      onPointerEnter() {
        send({ type: "POINTER_ENTER" });
      },
      onPointerLeave() {
        send({ type: "POINTER_LEAVE" });
      },
      onFocus() {
        send({ type: "FOCUS" });
      },
      onBlur() {
        send({ type: "BLUR" });
      },
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.Escape)) {
          send({ type: "ESCAPE" });
        }
      },
    },
    positionerProps: {
      "data-scope": "tooltip",
      "data-part": "positioner",
      "data-state": state,
      id: positionerId,
    },
    contentProps: {
      "data-scope": "tooltip",
      "data-part": "content",
      "data-state": state,
      id: contentId,
      role: "tooltip",
    },
    arrowProps: {
      "data-scope": "tooltip",
      "data-part": "arrow",
      "data-state": state,
    },
  };
}
