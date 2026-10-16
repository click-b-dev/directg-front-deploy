/**
 * Popover 상태머신
 * WAI-ARIA Popover (non-modal dialog) 패턴의 열기/닫기 상태를 관리한다.
 *
 * States:
 *   closed ─OPEN/TOGGLE──→ open
 *   open ─CLOSE/TOGGLE──→ closed
 */

import type { MachineDefinition, TransitionResult } from "@/machines/shared/types";
import type { PopoverState, PopoverContext, PopoverEvent } from "./types";

export function createPopoverMachine(options: {
  id: string;
  open?: boolean;
}): MachineDefinition<PopoverState, PopoverContext, PopoverEvent> {
  const { id, open = false } = options;

  return {
    initialState: open ? "open" : "closed",
    initialContext: { id },
    transition(
      state: PopoverState,
      context: PopoverContext,
      event: PopoverEvent,
    ): TransitionResult<PopoverState, PopoverContext> {
      switch (state) {
        case "closed": {
          if (event.type === "OPEN" || event.type === "TOGGLE") {
            return { state: "open", context };
          }
          return { state, context };
        }

        case "open": {
          if (event.type === "CLOSE" || event.type === "TOGGLE") {
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
