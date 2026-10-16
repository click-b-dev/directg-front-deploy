/**
 * Dialog connect
 * 머신 상태를 WAI-ARIA Dialog (Modal) 패턴의 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { ariaAttr } from "@/machines/shared/dom";
import { Keys, isKey } from "@/machines/shared/keyboard";
import type { DialogState, DialogContext, DialogEvent } from "./types";

export interface DialogConnectReturn {
  /** 열림 상태 */
  isOpen: boolean;
  /** trigger 버튼 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": DialogState;
    id: string;
    "aria-haspopup": "dialog";
    "aria-expanded": "true" | "false";
    "aria-controls": string;
    onClick: () => void;
  };
  /** backdrop 오버레이 속성 */
  backdropProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": DialogState;
    id: string;
    "aria-hidden": "true";
    onClick: () => void;
  };
  /** positioner (정렬 래퍼) 속성 */
  positionerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": DialogState;
    id: string;
  };
  /** content 영역 속성 */
  contentProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": DialogState;
    id: string;
    role: "dialog";
    "aria-modal": "true";
    "aria-labelledby": string;
    "aria-describedby": string;
    tabIndex: number;
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
}

export function connectDialog(
  state: DialogState,
  context: DialogContext,
  send: Send<DialogEvent>,
): DialogConnectReturn {
  const isOpen = state === "open";
  const triggerId = `${context.id}-trigger`;
  const backdropId = `${context.id}-backdrop`;
  const positionerId = `${context.id}-positioner`;
  const contentId = `${context.id}-content`;
  const titleId = `${context.id}-title`;
  const descriptionId = `${context.id}-description`;

  return {
    isOpen,
    triggerProps: {
      "data-scope": "dialog",
      "data-part": "trigger",
      "data-state": state,
      id: triggerId,
      "aria-haspopup": "dialog",
      "aria-expanded": ariaAttr(isOpen),
      "aria-controls": contentId,
      onClick() {
        send({ type: "OPEN" });
      },
    },
    backdropProps: {
      "data-scope": "dialog",
      "data-part": "backdrop",
      "data-state": state,
      id: backdropId,
      "aria-hidden": "true",
      onClick() {
        send({ type: "CLOSE" });
      },
    },
    positionerProps: {
      "data-scope": "dialog",
      "data-part": "positioner",
      "data-state": state,
      id: positionerId,
    },
    contentProps: {
      "data-scope": "dialog",
      "data-part": "content",
      "data-state": state,
      id: contentId,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      "aria-describedby": descriptionId,
      tabIndex: -1,
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.Escape)) {
          e.stopPropagation();
          send({ type: "CLOSE" });
        }
      },
    },
    titleProps: {
      "data-scope": "dialog",
      "data-part": "title",
      id: titleId,
    },
    descriptionProps: {
      "data-scope": "dialog",
      "data-part": "description",
      id: descriptionId,
    },
    closeTriggerProps: {
      "data-scope": "dialog",
      "data-part": "close-trigger",
      type: "button",
      "aria-label": "Close",
      onClick() {
        send({ type: "CLOSE" });
      },
    },
  };
}
