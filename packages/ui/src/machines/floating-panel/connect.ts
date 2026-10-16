/**
 * FloatingPanel connect
 * 머신 상태를 드래그/리사이즈 가능한 패널 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { ariaAttr } from "@/machines/shared/dom";
import { Keys, isKey } from "@/machines/shared/keyboard";
import type { FloatingPanelState, FloatingPanelContext, FloatingPanelEvent } from "./types";

export interface FloatingPanelConnectReturn {
  /** 패널이 열려있는지 (closed 아닌 모든 상태) */
  isOpen: boolean;
  /** 드래그 중인지 */
  isDragging: boolean;
  /** 리사이즈 중인지 */
  isResizing: boolean;
  /** 최소화 상태인지 */
  isMinimized: boolean;
  /** 최대화 상태인지 */
  isMaximized: boolean;
  /** 현재 패널 위치 */
  position: { x: number; y: number };
  /** 현재 패널 크기 */
  size: { width: number; height: number };
  /** trigger 속성 */
  triggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": FloatingPanelState;
    id: string;
    "aria-haspopup": "dialog";
    "aria-expanded": "true" | "false";
    "aria-controls": string;
    onClick: () => void;
  };
  /** positioner 속성 */
  positionerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": FloatingPanelState;
    id: string;
    style: React.CSSProperties;
  };
  /** content 속성 */
  contentProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": FloatingPanelState;
    id: string;
    role: "dialog";
    "aria-labelledby": string;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    style: React.CSSProperties;
  };
  /** header 속성 */
  headerProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** title 속성 */
  titleProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** body 속성 */
  bodyProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
    style: React.CSSProperties;
  };
  /** dragTrigger 속성 */
  dragTriggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-dragging": "" | undefined;
    id: string;
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
  /** resizeTrigger props 반환 */
  getResizeTriggerProps(props: { direction: string }): {
    "data-scope": string;
    "data-part": string;
    "data-direction": string;
    id: string;
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
  /** closeTrigger 속성 */
  closeTriggerProps: {
    "data-scope": string;
    "data-part": string;
    type: "button";
    "aria-label": string;
    onClick: () => void;
  };
  /** minimizeTrigger 속성 */
  minimizeTriggerProps: {
    "data-scope": string;
    "data-part": string;
    type: "button";
    "aria-label": string;
    onClick: () => void;
  };
  /** maximizeTrigger 속성 */
  maximizeTriggerProps: {
    "data-scope": string;
    "data-part": string;
    type: "button";
    "aria-label": string;
    onClick: () => void;
  };
}

const RESIZE_CURSORS: Record<string, string> = {
  n: "n-resize",
  s: "s-resize",
  e: "e-resize",
  w: "w-resize",
  ne: "ne-resize",
  nw: "nw-resize",
  se: "se-resize",
  sw: "sw-resize",
};

export function connectFloatingPanel(
  state: FloatingPanelState,
  context: FloatingPanelContext,
  send: Send<FloatingPanelEvent>,
): FloatingPanelConnectReturn {
  const isOpen = state !== "closed";
  const isDragging = state === "dragging";
  const isResizing = state === "resizing";
  const isMinimized = state === "minimized";
  const isMaximized = state === "maximized";

  const contentId = `${context.id}-content`;
  const titleId = `${context.id}-title`;

  return {
    isOpen,
    isDragging,
    isResizing,
    isMinimized,
    isMaximized,
    position: context.position,
    size: context.size,
    triggerProps: {
      "data-scope": "floating-panel",
      "data-part": "trigger",
      "data-state": state,
      id: `${context.id}-trigger`,
      "aria-haspopup": "dialog",
      "aria-expanded": ariaAttr(isOpen),
      "aria-controls": contentId,
      onClick() {
        send({ type: "TOGGLE" });
      },
    },
    positionerProps: {
      "data-scope": "floating-panel",
      "data-part": "positioner",
      "data-state": state,
      id: `${context.id}-positioner`,
      style: isMaximized
        ? {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 50,
          }
        : {
            position: "fixed",
            top: `${context.position.y}px`,
            left: `${context.position.x}px`,
            zIndex: 50,
          },
    },
    contentProps: {
      "data-scope": "floating-panel",
      "data-part": "content",
      "data-state": state,
      id: contentId,
      role: "dialog",
      "aria-labelledby": titleId,
      tabIndex: -1,
      onKeyDown(e: React.KeyboardEvent) {
        if (isKey(e.key, Keys.Escape)) {
          e.stopPropagation();
          send({ type: "CLOSE" });
        }
      },
      style: isMaximized
        ? { width: "100%", height: "100%" }
        : isMinimized
          ? { width: `${context.size.width}px`, overflow: "hidden" }
          : {
              width: `${context.size.width}px`,
              height: `${context.size.height}px`,
            },
    },
    headerProps: {
      "data-scope": "floating-panel",
      "data-part": "header",
      id: `${context.id}-header`,
    },
    titleProps: {
      "data-scope": "floating-panel",
      "data-part": "title",
      id: titleId,
    },
    bodyProps: {
      "data-scope": "floating-panel",
      "data-part": "body",
      id: `${context.id}-body`,
      style: isMinimized ? { display: "none" } : {},
    },
    dragTriggerProps: {
      "data-scope": "floating-panel",
      "data-part": "drag-trigger",
      "data-dragging": isDragging ? ("" as const) : undefined,
      id: `${context.id}-drag-trigger`,
      onPointerDown(e: React.PointerEvent) {
        if (isMinimized || isMaximized) return;
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        send({ type: "DRAG_START", pointerX: e.clientX, pointerY: e.clientY });
      },
      style: { cursor: "grab" },
    },
    getResizeTriggerProps(props: { direction: string }) {
      return {
        "data-scope": "floating-panel" as const,
        "data-part": "resize-trigger" as const,
        "data-direction": props.direction,
        id: `${context.id}-resize-${props.direction}`,
        onPointerDown(e: React.PointerEvent) {
          if (isMinimized || isMaximized) return;
          e.preventDefault();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          send({
            type: "RESIZE_START",
            pointerX: e.clientX,
            pointerY: e.clientY,
            direction: props.direction,
          });
        },
        style: {
          cursor: RESIZE_CURSORS[props.direction] ?? "default",
        },
      };
    },
    closeTriggerProps: {
      "data-scope": "floating-panel",
      "data-part": "close-trigger",
      type: "button",
      "aria-label": "Close panel",
      onClick() {
        send({ type: "CLOSE" });
      },
    },
    minimizeTriggerProps: {
      "data-scope": "floating-panel",
      "data-part": "minimize-trigger",
      type: "button",
      "aria-label": isMinimized ? "Restore panel" : "Minimize panel",
      onClick() {
        if (isMinimized) {
          send({ type: "RESTORE" });
        } else {
          send({ type: "MINIMIZE" });
        }
      },
    },
    maximizeTriggerProps: {
      "data-scope": "floating-panel",
      "data-part": "maximize-trigger",
      type: "button",
      "aria-label": isMaximized ? "Restore panel" : "Maximize panel",
      onClick() {
        if (isMaximized) {
          send({ type: "RESTORE" });
        } else {
          send({ type: "MAXIMIZE" });
        }
      },
    },
  };
}
