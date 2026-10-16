/**
 * HoverCard 상태머신
 * Tooltip과 유사하지만 trigger에서 content로 마우스 이동 시 닫히지 않는 패턴.
 *
 * States:
 *   closed ─POINTER_ENTER──→ opening (delay)
 *   opening ─OPEN_DELAY_COMPLETE──→ open
 *   opening ─POINTER_LEAVE/ESCAPE──→ closed
 *   open ─POINTER_LEAVE──→ closing (delay)
 *   open ─CONTENT_POINTER_ENTER──→ open (유지)
 *   open ─ESCAPE──→ closed
 *   closing ─CLOSE_DELAY_COMPLETE──→ closed
 *   closing ─POINTER_ENTER/CONTENT_POINTER_ENTER──→ open
 */

import type { MachineDefinition, TransitionResult } from "@/machines/shared/types";
import type { HoverCardState, HoverCardContext, HoverCardEvent } from "./types";

export function createHoverCardMachine(options: {
  id: string;
  open?: boolean;
  openDelay?: number;
  closeDelay?: number;
}): MachineDefinition<HoverCardState, HoverCardContext, HoverCardEvent> {
  const { id, open = false, openDelay = 700, closeDelay = 300 } = options;

  return {
    initialState: open ? "open" : "closed",
    initialContext: { id, openDelay, closeDelay },
    transition(
      state: HoverCardState,
      context: HoverCardContext,
      event: HoverCardEvent,
    ): TransitionResult<HoverCardState, HoverCardContext> {
      switch (state) {
        case "closed": {
          if (event.type === "POINTER_ENTER" || event.type === "OPEN") {
            return { state: "opening", context };
          }
          return { state, context };
        }

        case "opening": {
          if (event.type === "OPEN_DELAY_COMPLETE") {
            return { state: "open", context };
          }
          if (event.type === "POINTER_LEAVE" || event.type === "ESCAPE" || event.type === "CLOSE") {
            return { state: "closed", context };
          }
          return { state, context };
        }

        case "open": {
          if (event.type === "POINTER_LEAVE" || event.type === "CONTENT_POINTER_LEAVE") {
            return { state: "closing", context };
          }
          if (event.type === "CONTENT_POINTER_ENTER") {
            return { state: "open", context };
          }
          if (event.type === "ESCAPE" || event.type === "CLOSE") {
            return { state: "closed", context };
          }
          return { state, context };
        }

        case "closing": {
          if (event.type === "CLOSE_DELAY_COMPLETE") {
            return { state: "closed", context };
          }
          if (
            event.type === "POINTER_ENTER" ||
            event.type === "CONTENT_POINTER_ENTER" ||
            event.type === "OPEN"
          ) {
            return { state: "open", context };
          }
          if (event.type === "ESCAPE" || event.type === "CLOSE") {
            return { state: "closed", context };
          }
          return { state, context };
        }

        default:
          return { state, context };
      }
    },
  };
}
