/**
 * Collapsible 상태머신
 * WAI-ARIA Disclosure 패턴의 열기/닫기 상태를 관리한다.
 *
 * States:
 *   closed ─TOGGLE/OPEN──→ open
 *   open ─TOGGLE/CLOSE──→ closed
 */

import type { MachineDefinition, TransitionResult } from "@/machines/shared/types";
import type { CollapsibleState, CollapsibleContext, CollapsibleEvent } from "./types";

export function createCollapsibleMachine(options: {
  id: string;
  open?: boolean;
  disabled?: boolean;
}): MachineDefinition<CollapsibleState, CollapsibleContext, CollapsibleEvent> {
  const { id, open = false, disabled = false } = options;

  return {
    initialState: open ? "open" : "closed",
    initialContext: { id, disabled },
    transition(
      state: CollapsibleState,
      context: CollapsibleContext,
      event: CollapsibleEvent,
    ): TransitionResult<CollapsibleState, CollapsibleContext> {
      if (context.disabled) {
        return { state, context };
      }

      switch (state) {
        case "closed": {
          if (event.type === "TOGGLE" || event.type === "OPEN") {
            return { state: "open", context };
          }
          return { state, context };
        }

        case "open": {
          if (event.type === "TOGGLE" || event.type === "CLOSE") {
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
