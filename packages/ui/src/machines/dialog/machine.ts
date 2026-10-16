/**
 * Dialog 상태머신
 * WAI-ARIA Dialog (Modal) 패턴의 열기/닫기 상태를 관리한다.
 *
 * States:
 *   closed ─OPEN/TOGGLE──→ open
 *   open ─CLOSE/TOGGLE──→ closed
 *
 * 포커스 트랩, 스크롤 방지 등의 side effect는 connect/component 레벨에서 처리한다.
 */

import type { MachineDefinition, TransitionResult } from "@/machines/shared/types";
import type { DialogState, DialogContext, DialogEvent } from "./types";

export function createDialogMachine(options: {
  id: string;
  open?: boolean;
}): MachineDefinition<DialogState, DialogContext, DialogEvent> {
  const { id, open = false } = options;

  return {
    initialState: open ? "open" : "closed",
    initialContext: { id },
    transition(
      state: DialogState,
      context: DialogContext,
      event: DialogEvent,
    ): TransitionResult<DialogState, DialogContext> {
      switch (state) {
        case "closed": {
          if (event.type === "OPEN" || event.type === "TOGGLE") {
            return {
              state: "open",
              context,
              effects: [{ type: "preventScroll" }],
            };
          }
          return { state, context };
        }

        case "open": {
          if (event.type === "CLOSE" || event.type === "TOGGLE") {
            return {
              state: "closed",
              context,
              effects: [{ type: "restoreScroll" }],
            };
          }
          return { state, context };
        }

        default:
          return { state, context };
      }
    },
  };
}
