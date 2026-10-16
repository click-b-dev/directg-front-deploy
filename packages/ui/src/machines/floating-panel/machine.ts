/**
 * FloatingPanel 상태머신
 * 드래그, 리사이즈, 최소화, 최대화를 관리한다.
 *
 * States:
 *   closed ─OPEN/TOGGLE──→ open
 *   open ─CLOSE/TOGGLE──→ closed
 *   open ─DRAG_START──→ dragging
 *   open ─RESIZE_START──→ resizing
 *   open ─MINIMIZE──→ minimized
 *   open ─MAXIMIZE──→ maximized
 *   dragging ─DRAG_END──→ open
 *   resizing ─RESIZE_END──→ open
 *   minimized ─RESTORE/MAXIMIZE──→ open/maximized
 *   maximized ─RESTORE/MINIMIZE──→ open/minimized
 */

import type { TransitionResult } from "@/machines/shared/types";
import type { FloatingPanelState, FloatingPanelContext, FloatingPanelEvent, Size } from "./types";

function clampSize(size: Size, min: Size, max: Size): Size {
  return {
    width: Math.max(min.width, Math.min(size.width, max.width)),
    height: Math.max(min.height, Math.min(size.height, max.height)),
  };
}

export function transition(
  state: FloatingPanelState,
  ctx: FloatingPanelContext,
  event: FloatingPanelEvent,
): TransitionResult<FloatingPanelState, FloatingPanelContext> {
  // 글로벌 이벤트
  if (event.type === "SET_CONTEXT") {
    return { state, context: { ...ctx, ...event.context } };
  }

  if (event.type === "SET_POSITION") {
    return { state, context: { ...ctx, position: event.position } };
  }

  if (event.type === "SET_SIZE") {
    const clamped = clampSize(event.size, ctx.minSize, ctx.maxSize);
    return { state, context: { ...ctx, size: clamped } };
  }

  switch (state) {
    case "closed": {
      if (event.type === "OPEN" || event.type === "TOGGLE") {
        return { state: "open", context: ctx };
      }
      return { state, context: ctx };
    }

    case "open": {
      if (event.type === "CLOSE" || event.type === "TOGGLE") {
        return { state: "closed", context: ctx };
      }
      if (event.type === "DRAG_START") {
        return {
          state: "dragging",
          context: {
            ...ctx,
            dragStart: { x: event.pointerX, y: event.pointerY },
            positionAtDragStart: { ...ctx.position },
          },
        };
      }
      if (event.type === "RESIZE_START") {
        return {
          state: "resizing",
          context: {
            ...ctx,
            resizeStart: { x: event.pointerX, y: event.pointerY },
            sizeAtResizeStart: { ...ctx.size },
            resizeDirection: event.direction,
          },
        };
      }
      if (event.type === "MINIMIZE") {
        return {
          state: "minimized",
          context: {
            ...ctx,
            prevPosition: { ...ctx.position },
            prevSize: { ...ctx.size },
          },
        };
      }
      if (event.type === "MAXIMIZE") {
        return {
          state: "maximized",
          context: {
            ...ctx,
            prevPosition: { ...ctx.position },
            prevSize: { ...ctx.size },
          },
        };
      }
      return { state, context: ctx };
    }

    case "dragging": {
      if (event.type === "DRAG_MOVE") {
        const dx = event.pointerX - ctx.dragStart.x;
        const dy = event.pointerY - ctx.dragStart.y;
        return {
          state: "dragging",
          context: {
            ...ctx,
            position: {
              x: ctx.positionAtDragStart.x + dx,
              y: ctx.positionAtDragStart.y + dy,
            },
          },
        };
      }
      if (event.type === "DRAG_END") {
        return { state: "open", context: ctx };
      }
      if (event.type === "CLOSE") {
        return { state: "closed", context: ctx };
      }
      return { state, context: ctx };
    }

    case "resizing": {
      if (event.type === "RESIZE_MOVE") {
        const dx = event.pointerX - ctx.resizeStart.x;
        const dy = event.pointerY - ctx.resizeStart.y;
        const dir = ctx.resizeDirection;

        let newWidth = ctx.sizeAtResizeStart.width;
        let newHeight = ctx.sizeAtResizeStart.height;
        let newX = ctx.position.x;
        let newY = ctx.position.y;

        if (dir.includes("e")) newWidth += dx;
        if (dir.includes("w")) {
          newWidth -= dx;
          newX = ctx.positionAtDragStart.x + dx;
        }
        if (dir.includes("s")) newHeight += dy;
        if (dir.includes("n")) {
          newHeight -= dy;
          newY = ctx.positionAtDragStart.y + dy;
        }

        const clamped = clampSize({ width: newWidth, height: newHeight }, ctx.minSize, ctx.maxSize);

        // Adjust position if clamping prevented resize from west/north
        if (dir.includes("w") && clamped.width !== newWidth) {
          newX = ctx.position.x;
        }
        if (dir.includes("n") && clamped.height !== newHeight) {
          newY = ctx.position.y;
        }

        return {
          state: "resizing",
          context: {
            ...ctx,
            size: clamped,
            position: { x: newX, y: newY },
          },
        };
      }
      if (event.type === "RESIZE_END") {
        return { state: "open", context: ctx };
      }
      if (event.type === "CLOSE") {
        return { state: "closed", context: ctx };
      }
      return { state, context: ctx };
    }

    case "minimized": {
      if (event.type === "RESTORE") {
        return {
          state: "open",
          context: {
            ...ctx,
            position: { ...ctx.prevPosition },
            size: { ...ctx.prevSize },
          },
        };
      }
      if (event.type === "MAXIMIZE") {
        return { state: "maximized", context: ctx };
      }
      if (event.type === "CLOSE" || event.type === "TOGGLE") {
        return { state: "closed", context: ctx };
      }
      return { state, context: ctx };
    }

    case "maximized": {
      if (event.type === "RESTORE") {
        return {
          state: "open",
          context: {
            ...ctx,
            position: { ...ctx.prevPosition },
            size: { ...ctx.prevSize },
          },
        };
      }
      if (event.type === "MINIMIZE") {
        return { state: "minimized", context: ctx };
      }
      if (event.type === "CLOSE" || event.type === "TOGGLE") {
        return { state: "closed", context: ctx };
      }
      return { state, context: ctx };
    }

    default:
      return { state, context: ctx };
  }
}

export function createFloatingPanelMachine(ctx: Partial<FloatingPanelContext> & { id: string }) {
  const initialContext: FloatingPanelContext = {
    id: ctx.id,
    position: ctx.position ?? { x: 100, y: 100 },
    size: ctx.size ?? { width: 400, height: 300 },
    minSize: ctx.minSize ?? { width: 200, height: 150 },
    maxSize: ctx.maxSize ?? { width: Infinity, height: Infinity },
    dragStart: { x: 0, y: 0 },
    positionAtDragStart: { x: 0, y: 0 },
    resizeStart: { x: 0, y: 0 },
    sizeAtResizeStart: { width: 0, height: 0 },
    resizeDirection: "",
    prevPosition: ctx.position ?? { x: 100, y: 100 },
    prevSize: ctx.size ?? { width: 400, height: 300 },
  };

  return {
    initialState: (ctx.position ? "open" : "closed") as FloatingPanelState,
    initialContext,
    transition,
  };
}
