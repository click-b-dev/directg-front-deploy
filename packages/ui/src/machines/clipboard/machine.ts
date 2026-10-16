/**
 * Clipboard 상태머신
 * 순수 함수 — React 의존성 없음
 */

import type { TransitionResult } from "@/machines/shared";
import type { ClipboardState, ClipboardContext, ClipboardEvent } from "./types";

export function transition(
  state: ClipboardState,
  ctx: ClipboardContext,
  event: ClipboardEvent,
): TransitionResult<ClipboardState, ClipboardContext> {
  switch (event.type) {
    case "COPY": {
      return {
        state: "copied",
        context: ctx,
        effects: [
          {
            type: "custom",
            handler: () => {
              navigator.clipboard.writeText(ctx.value).catch(() => {
                // 클립보드 API 실패 시 fallback
                fallbackCopy(ctx.value);
              });
            },
          },
        ],
      };
    }

    case "COPY_DONE": {
      return {
        state: "copied",
        context: ctx,
      };
    }

    case "RESET": {
      return {
        state: "idle",
        context: ctx,
      };
    }

    case "SET_VALUE": {
      return {
        state,
        context: { ...ctx, value: event.value },
      };
    }

    case "SET_CONTEXT": {
      return {
        state,
        context: { ...ctx, ...event.context },
      };
    }

    default:
      return { state, context: ctx };
  }
}

function fallbackCopy(text: string): void {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
  } catch {
    // 최종 fallback 실패 — 조용히 무시
  }
  document.body.removeChild(textarea);
}

export function createClipboardMachine(ctx: Partial<ClipboardContext> & { id: string }) {
  const initialContext: ClipboardContext = {
    value: ctx.value ?? "",
    timeout: ctx.timeout ?? 2000,
    id: ctx.id,
  };

  return {
    initialState: "idle" as ClipboardState,
    initialContext,
    transition,
  };
}
