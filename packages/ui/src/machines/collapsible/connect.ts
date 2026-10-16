/**
 * Collapsible connect
 * 머신 상태를 WAI-ARIA Disclosure 패턴의 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { dataAttr, ariaAttr } from "@/machines/shared/dom";
import { Keys, isKey } from "@/machines/shared/keyboard";
import type { CollapsibleState, CollapsibleContext, CollapsibleEvent } from "./types";

export interface CollapsibleConnectReturn {
  /** 열림 상태 */
  isOpen: boolean;
  /** root 요소 속성 */
  rootProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": CollapsibleState;
  };
  /** trigger 버튼 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": CollapsibleState;
    "data-disabled": "" | undefined;
    id: string;
    type: "button";
    "aria-expanded": "true" | "false";
    "aria-controls": string;
    disabled: boolean;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** content 영역 속성 */
  contentProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": CollapsibleState;
    id: string;
    role: "region";
    "aria-labelledby": string;
    hidden: boolean;
  };
}

export function connectCollapsible(
  state: CollapsibleState,
  context: CollapsibleContext,
  send: Send<CollapsibleEvent>,
): CollapsibleConnectReturn {
  const isOpen = state === "open";
  const triggerId = `${context.id}-trigger`;
  const contentId = `${context.id}-content`;

  return {
    isOpen,
    rootProps: {
      "data-scope": "collapsible",
      "data-part": "root",
      "data-state": state,
    },
    triggerProps: {
      "data-scope": "collapsible",
      "data-part": "trigger",
      "data-state": state,
      "data-disabled": dataAttr(context.disabled),
      id: triggerId,
      type: "button",
      "aria-expanded": ariaAttr(isOpen),
      "aria-controls": contentId,
      disabled: context.disabled,
      onClick() {
        send({ type: "TOGGLE" });
      },
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.Enter, Keys.Space)) {
          e.preventDefault();
          send({ type: "TOGGLE" });
        }
      },
    },
    contentProps: {
      "data-scope": "collapsible",
      "data-part": "content",
      "data-state": state,
      id: contentId,
      role: "region",
      "aria-labelledby": triggerId,
      hidden: !isOpen,
    },
  };
}
