/**
 * Tooltip 상태머신
 * WAI-ARIA Tooltip 패턴의 열기/닫기 상태를 지연 시간과 함께 관리한다.
 *
 * States:
 *   closed ─POINTER_ENTER──→ opening (delay)
 *   closed ─FOCUS──→ open (즉시)
 *   opening ─OPEN_DELAY_COMPLETE──→ open
 *   opening ─POINTER_LEAVE/ESCAPE──→ closed
 *   open ─POINTER_LEAVE──→ closing (delay)
 *   open ─ESCAPE/BLUR──→ closed (즉시)
 *   closing ─CLOSE_DELAY_COMPLETE──→ closed
 *   closing ─POINTER_ENTER──→ open
 */

import type { MachineDefinition, TransitionResult } from "@/machines/shared/types";
import type { TooltipState, TooltipContext, TooltipEvent } from "./types";

export function createTooltipMachine(options: {
  id: string;
  open?: boolean;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
}): MachineDefinition<TooltipState, TooltipContext, TooltipEvent> {
  const { id, open = false, openDelay = 700, closeDelay = 300, disabled = false } = options;

  return {
    initialState: open ? "open" : "closed",
    initialContext: { id, openDelay, closeDelay, disabled },
    transition(
      state: TooltipState,
      context: TooltipContext,
      event: TooltipEvent,
    ): TransitionResult<TooltipState, TooltipContext> {
      if (context.disabled) {
        return { state: "closed", context };
      }

      switch (state) {
        case "closed": {
          if (event.type === "POINTER_ENTER") {
            return { state: "opening", context };
          }
          if (event.type === "FOCUS" || event.type === "OPEN") {
            return { state: "open", context };
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
          if (event.type === "FOCUS") {
            return { state: "open", context };
          }
          return { state, context };
        }

        case "open": {
          if (event.type === "POINTER_LEAVE") {
            return { state: "closing", context };
          }
          if (event.type === "ESCAPE" || event.type === "BLUR" || event.type === "CLOSE") {
            return { state: "closed", context };
          }
          return { state, context };
        }

        case "closing": {
          if (event.type === "CLOSE_DELAY_COMPLETE") {
            return { state: "closed", context };
          }
          if (event.type === "POINTER_ENTER" || event.type === "FOCUS") {
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
