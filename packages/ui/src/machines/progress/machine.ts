import type { MachineDefinition } from "@/machines/shared/types";
import type { ProgressState, ProgressContext, ProgressEvent } from "./types";

function deriveState(ctx: ProgressContext): ProgressState {
  if (ctx.value === null) return "indeterminate";
  if (ctx.value >= ctx.max) return "complete";
  return "loading";
}

function clampValue(value: number | null, min: number, max: number): number | null {
  if (value === null) return null;
  return Math.min(Math.max(value, min), max);
}

export function createProgressMachine(
  initialContext: Partial<ProgressContext> = {},
): MachineDefinition<ProgressState, ProgressContext, ProgressEvent> {
  const context: ProgressContext = {
    value: null,
    min: 0,
    max: 100,
    ...initialContext,
  };
  context.value = clampValue(context.value, context.min, context.max);

  return {
    initialState: deriveState(context),
    initialContext: context,
    transition(state, ctx, event) {
      switch (event.type) {
        case "SET_VALUE": {
          const clamped = clampValue(event.value, ctx.min, ctx.max);
          const nextCtx = { ...ctx, value: clamped };
          return { state: deriveState(nextCtx), context: nextCtx };
        }
        case "SET_CONTEXT": {
          const nextCtx = { ...ctx, ...event.context };
          if (event.context.value !== undefined) {
            nextCtx.value = clampValue(nextCtx.value, nextCtx.min, nextCtx.max);
          }
          return { state: deriveState(nextCtx), context: nextCtx };
        }
        default:
          return { state, context: ctx };
      }
    },
  };
}
