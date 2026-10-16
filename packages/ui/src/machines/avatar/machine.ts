import type { MachineDefinition } from "@/machines/shared/types";
import type { AvatarState, AvatarContext, AvatarEvent } from "./types";

export function createAvatarMachine(
  initialContext: Partial<AvatarContext> = {},
): MachineDefinition<AvatarState, AvatarContext, AvatarEvent> {
  const context: AvatarContext = {
    src: undefined,
    loadState: initialContext.src ? "loading" : "error",
    ...initialContext,
  };

  return {
    initialState: context.loadState,
    initialContext: context,
    transition(state, ctx, event) {
      switch (event.type) {
        case "IMAGE_LOAD": {
          return { state: "loaded", context: { ...ctx, loadState: "loaded" } };
        }
        case "IMAGE_ERROR": {
          return { state: "error", context: { ...ctx, loadState: "error" } };
        }
        case "SET_CONTEXT": {
          const nextCtx = { ...ctx, ...event.context };
          // src가 변경되면 loading 상태로 리셋
          if (event.context.src !== undefined && event.context.src !== ctx.src) {
            const newState: AvatarState = event.context.src ? "loading" : "error";
            return { state: newState, context: { ...nextCtx, loadState: newState } };
          }
          return { state, context: nextCtx };
        }
        default:
          return { state, context: ctx };
      }
    },
  };
}
