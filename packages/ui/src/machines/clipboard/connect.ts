/**
 * Clipboard connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { ClipboardState, ClipboardContext, ClipboardEvent } from "./types";
import { SCOPE, clipboardAnatomy } from "./anatomy";

export interface ClipboardApi {
  value: string;
  copied: boolean;
  copy(): void;
  getRootProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getControlProps(): Record<string, unknown>;
  getInputProps(): Record<string, unknown>;
  getTriggerProps(): Record<string, unknown>;
  getIndicatorProps(props: { copied: boolean }): Record<string, unknown>;
}

export function connect(
  state: ClipboardState,
  ctx: ClipboardContext,
  send: Send<ClipboardEvent>,
): ClipboardApi {
  const isCopied = state === "copied";

  function getLabelId(): string {
    return `${ctx.id}:label`;
  }

  function getInputId(): string {
    return `${ctx.id}:input`;
  }

  return {
    value: ctx.value,
    copied: isCopied,

    copy() {
      send({ type: "COPY" });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": clipboardAnatomy.root,
        "data-state": isCopied ? "copied" : "idle",
        id: ctx.id,
      };
    },

    getLabelProps() {
      return {
        id: getLabelId(),
        "data-scope": SCOPE,
        "data-part": clipboardAnatomy.label,
        htmlFor: getInputId(),
      };
    },

    getControlProps() {
      return {
        "data-scope": SCOPE,
        "data-part": clipboardAnatomy.control,
        "data-state": isCopied ? "copied" : "idle",
      };
    },

    getInputProps() {
      return {
        id: getInputId(),
        "data-scope": SCOPE,
        "data-part": clipboardAnatomy.input,
        type: "text" as const,
        readOnly: true,
        value: ctx.value,
        "aria-labelledby": getLabelId(),
        "aria-readonly": "true" as const,
      };
    },

    getTriggerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": clipboardAnatomy.trigger,
        "data-state": isCopied ? "copied" : "idle",
        type: "button" as const,
        "aria-label": isCopied ? "Copied" : "Copy to clipboard",
        onClick: composeEventHandlers(() => {
          send({ type: "COPY" });
        }),
      };
    },

    getIndicatorProps(props) {
      const shouldShow = props.copied === isCopied;

      return {
        "data-scope": SCOPE,
        "data-part": clipboardAnatomy.indicator,
        "data-state": isCopied ? "copied" : "idle",
        "data-displayed": dataAttr(shouldShow),
        hidden: !shouldShow,
      };
    },
  };
}
