/**
 * Splitter connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { SplitterState, SplitterContext, SplitterEvent } from "./types";
import { SCOPE, splitterAnatomy } from "./anatomy";

export interface SplitterApi {
  sizes: number[];
  isDragging: boolean;
  activeHandleIndex: number;
  setSizes(sizes: number[]): void;
  getRootProps(): Record<string, unknown>;
  getPanelProps(props: { index: number }): Record<string, unknown>;
  getResizeTriggerProps(props: { index: number }): Record<string, unknown>;
}

export function connect(
  state: SplitterState,
  ctx: SplitterContext,
  send: Send<SplitterEvent>,
): SplitterApi {
  const isDragging = state === "dragging";
  const isHorizontal = ctx.orientation === "horizontal";

  function getHandleId(index: number): string {
    return `${ctx.id}:handle:${index}`;
  }

  function getPanelId(index: number): string {
    return `${ctx.id}:panel:${index}`;
  }

  return {
    sizes: ctx.sizes,
    isDragging,
    activeHandleIndex: ctx.activeHandleIndex,

    setSizes(sizes: number[]) {
      send({ type: "SET_SIZES", sizes });
    },

    getRootProps() {
      return {
        id: ctx.id,
        "data-scope": SCOPE,
        "data-part": splitterAnatomy.root,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
        style: {
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
        },
      };
    },

    getPanelProps(props) {
      const { index } = props;
      const size = ctx.sizes[index] ?? 0;

      return {
        id: getPanelId(index),
        "data-scope": SCOPE,
        "data-part": splitterAnatomy.panel,
        "data-orientation": ctx.orientation,
        "data-index": index,
        style: {
          flexBasis: `${size}%`,
          flexGrow: 0,
          flexShrink: 0,
          overflow: "hidden",
        },
      };
    },

    getResizeTriggerProps(props) {
      const { index } = props;
      const leftSize = ctx.sizes[index] ?? 0;
      const minVal = ctx.panels[index]?.min ?? 0;
      const maxVal = ctx.panels[index]?.max ?? 100;
      const isActive = isDragging && ctx.activeHandleIndex === index;

      return {
        id: getHandleId(index),
        "data-scope": SCOPE,
        "data-part": splitterAnatomy.resizeTrigger,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
        "data-focus": dataAttr(isActive),
        "data-index": index,
        role: "separator",
        tabIndex: ctx.disabled ? -1 : 0,
        "aria-valuenow": leftSize,
        "aria-valuemin": minVal,
        "aria-valuemax": maxVal,
        "aria-orientation": ctx.orientation,
        "aria-label": `Resize handle between panel ${index + 1} and panel ${index + 2}`,
        "aria-controls": `${getPanelId(index)} ${getPanelId(index + 1)}`,
        style: {
          cursor: isHorizontal ? "col-resize" : "row-resize",
        },
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (ctx.disabled) return;
          const handled = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
            "Enter",
          ];
          if (handled.includes(e.key)) {
            e.preventDefault();
            send({ type: "HANDLE_KEY_DOWN", index, key: e.key });
          }
        }),
        onDoubleClick: composeEventHandlers(() => {
          if (ctx.disabled) return;
          send({ type: "HANDLE_DOUBLE_CLICK", index });
        }),
        onPointerDown: composeEventHandlers((e: PointerEvent) => {
          if (ctx.disabled) return;
          e.preventDefault();
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          send({ type: "HANDLE_POINTER_DOWN", index });

          const rootEl = document.getElementById(ctx.id);
          if (!rootEl) return;

          let prevPos = isHorizontal ? e.clientX : e.clientY;
          const totalSize = isHorizontal ? rootEl.offsetWidth : rootEl.offsetHeight;

          const onPointerMove = (moveEvent: PointerEvent) => {
            const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
            const pixelDelta = currentPos - prevPos;
            prevPos = currentPos;
            const percentDelta = (pixelDelta / totalSize) * 100;
            send({ type: "POINTER_MOVE", delta: percentDelta });
          };

          const onPointerUp = () => {
            send({ type: "POINTER_UP" });
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
          };

          document.addEventListener("pointermove", onPointerMove);
          document.addEventListener("pointerup", onPointerUp);
        }),
      };
    },
  };
}
