/**
 * SignaturePad 상태머신
 * 서명 그리기, 지우기를 관리한다.
 *
 * States:
 *   idle ─DRAW_START──→ drawing
 *   drawing ─DRAW_MOVE──→ drawing (점 추가)
 *   drawing ─DRAW_END──→ idle (획 완료)
 */

import type { TransitionResult } from "@/machines/shared/types";
import type { SignaturePadState, SignaturePadContext, SignaturePadEvent } from "./types";

export function transition(
  state: SignaturePadState,
  ctx: SignaturePadContext,
  event: SignaturePadEvent,
): TransitionResult<SignaturePadState, SignaturePadContext> {
  if (ctx.disabled || ctx.readOnly) {
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  switch (event.type) {
    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    case "DRAW_START": {
      return {
        state: "drawing",
        context: { ...ctx, currentPath: [event.point] },
      };
    }

    case "DRAW_MOVE": {
      if (state !== "drawing") return { state, context: ctx };
      return {
        state: "drawing",
        context: {
          ...ctx,
          currentPath: [...ctx.currentPath, event.point],
        },
      };
    }

    case "DRAW_END": {
      if (state !== "drawing") return { state, context: ctx };
      const completedPaths =
        ctx.currentPath.length > 0 ? [...ctx.paths, ctx.currentPath] : ctx.paths;
      return {
        state: "idle",
        context: {
          ...ctx,
          paths: completedPaths,
          currentPath: [],
        },
      };
    }

    case "CLEAR": {
      return {
        state: "idle",
        context: { ...ctx, paths: [], currentPath: [] },
        effects: [{ type: "announce", message: "Signature cleared" }],
      };
    }

    default:
      return { state, context: ctx };
  }
}

export function createSignaturePadMachine(ctx: Partial<SignaturePadContext> & { id: string }) {
  const initialContext: SignaturePadContext = {
    id: ctx.id,
    paths: ctx.paths ?? [],
    currentPath: [],
    disabled: ctx.disabled ?? false,
    readOnly: ctx.readOnly ?? false,
  };

  return {
    initialState: "idle" as SignaturePadState,
    initialContext,
    transition,
  };
}
