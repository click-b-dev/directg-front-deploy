/**
 * Presence 상태머신
 * enter/exit 애니메이션의 라이프사이클을 관리한다.
 *
 * States:
 *   unmounted ─MOUNT──→ entering ─ANIMATION_END──→ mounted
 *   mounted ─UNMOUNT──→ exiting ─ANIMATION_END──→ unmounted
 *
 * 애니메이션 비활성화 시 entering/exiting을 건너뛴다.
 */

import type { MachineDefinition, TransitionResult } from "@/machines/shared/types";
import type { PresenceState, PresenceContext, PresenceEvent } from "./types";

export function createPresenceMachine(options: {
  present: boolean;
  animationEnabled?: boolean;
}): MachineDefinition<PresenceState, PresenceContext, PresenceEvent> {
  const { present, animationEnabled = true } = options;

  return {
    initialState: present ? "mounted" : "unmounted",
    initialContext: {
      present,
      animationEnabled,
    },
    transition(
      state: PresenceState,
      context: PresenceContext,
      event: PresenceEvent,
    ): TransitionResult<PresenceState, PresenceContext> {
      switch (state) {
        case "unmounted": {
          if (event.type === "MOUNT") {
            if (context.animationEnabled) {
              return { state: "entering", context };
            }
            return { state: "mounted", context };
          }
          return { state, context };
        }

        case "entering": {
          if (event.type === "ANIMATION_END") {
            return { state: "mounted", context };
          }
          if (event.type === "UNMOUNT") {
            return { state: "unmounted", context };
          }
          return { state, context };
        }

        case "mounted": {
          if (event.type === "UNMOUNT") {
            if (context.animationEnabled) {
              return { state: "exiting", context };
            }
            return { state: "unmounted", context };
          }
          return { state, context };
        }

        case "exiting": {
          if (event.type === "ANIMATION_END") {
            return { state: "unmounted", context };
          }
          if (event.type === "MOUNT") {
            return { state: "entering", context };
          }
          return { state, context };
        }

        default:
          return { state, context };
      }
    },
  };
}
