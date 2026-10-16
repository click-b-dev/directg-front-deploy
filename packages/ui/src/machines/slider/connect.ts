/**
 * Slider connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { SliderState, SliderContext, SliderEvent } from "./types";
import { SCOPE, sliderAnatomy } from "./anatomy";

export interface SliderApi {
  value: number[];
  isDragging: boolean;
  setValue(value: number[]): void;
  getValuePercent(index: number): number;
  getRootProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getControlProps(): Record<string, unknown>;
  getTrackProps(): Record<string, unknown>;
  getRangeProps(): Record<string, unknown>;
  getThumbProps(props: { index: number }): Record<string, unknown>;
  getValueTextProps(): Record<string, unknown>;
  getMarkerGroupProps(): Record<string, unknown>;
  getMarkerProps(props: { value: number }): Record<string, unknown>;
}

function getPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

export function connect(
  state: SliderState,
  ctx: SliderContext,
  send: Send<SliderEvent>,
): SliderApi {
  const isDragging = state === "dragging";
  const isHorizontal = ctx.orientation === "horizontal";

  function getThumbId(index: number): string {
    return `${ctx.id}:thumb:${index}`;
  }

  function getTrackId(): string {
    return `${ctx.id}:track`;
  }

  function getLabelId(): string {
    return `${ctx.id}:label`;
  }

  function getValuePercent(index: number): number {
    const val = ctx.value[index];
    if (val === undefined) return 0;
    return getPercent(val, ctx.min, ctx.max);
  }

  /** 트랙 요소 기준 포인터 위치를 0-1 비율로 변환 */
  function getPositionFromPointer(trackEl: HTMLElement, clientX: number, clientY: number): number {
    const rect = trackEl.getBoundingClientRect();
    if (isHorizontal) {
      return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    }
    // vertical: 아래가 min, 위가 max
    return Math.min(Math.max(1 - (clientY - rect.top) / rect.height, 0), 1);
  }

  return {
    value: ctx.value,
    isDragging,

    setValue(value: number[]) {
      send({ type: "SET_VALUE", value });
    },

    getValuePercent,

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.root,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
        id: ctx.id,
      };
    },

    getLabelProps() {
      return {
        id: getLabelId(),
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.label,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
        htmlFor: getThumbId(0),
      };
    },

    getControlProps() {
      return {
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.control,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
      };
    },

    getTrackProps() {
      return {
        id: getTrackId(),
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.track,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
      };
    },

    getRangeProps() {
      const minPercent = ctx.value.length > 1 ? getValuePercent(0) : 0;
      const maxPercent = getValuePercent(ctx.value.length - 1);

      const style: Record<string, string> = {};
      if (isHorizontal) {
        style.left = `${minPercent}%`;
        style.width = `${maxPercent - minPercent}%`;
      } else {
        style.bottom = `${minPercent}%`;
        style.height = `${maxPercent - minPercent}%`;
      }

      return {
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.range,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
        style,
      };
    },

    getThumbProps(props) {
      const { index } = props;
      const val = ctx.value[index] ?? ctx.min;
      const percent = getPercent(val, ctx.min, ctx.max);
      const isActive = isDragging && ctx.activeThumbIndex === index;

      const style: Record<string, string> = {};
      if (isHorizontal) {
        style.left = `${percent}%`;
      } else {
        style.bottom = `${percent}%`;
      }
      style.position = "absolute";

      return {
        id: getThumbId(index),
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.thumb,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
        "data-focus": dataAttr(isActive),
        "data-index": index,
        role: "slider",
        tabIndex: ctx.disabled ? -1 : 0,
        "aria-valuenow": val,
        "aria-valuemin": ctx.min,
        "aria-valuemax": ctx.max,
        "aria-orientation": ctx.orientation,
        "aria-disabled": ctx.disabled ? ariaAttr(true) : undefined,
        "aria-readonly": ctx.readOnly ? ariaAttr(true) : undefined,
        "aria-labelledby": getLabelId(),
        style,
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (ctx.disabled || ctx.readOnly) return;
          const handled = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "PageUp",
            "PageDown",
            "Home",
            "End",
          ];
          if (handled.includes(e.key)) {
            e.preventDefault();
            send({ type: "THUMB_KEY_DOWN", index, key: e.key });
          }
        }),
        onPointerDown: composeEventHandlers((e: PointerEvent) => {
          if (ctx.disabled || ctx.readOnly) return;
          e.preventDefault();
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          send({ type: "THUMB_POINTER_DOWN", index });

          const trackEl = document.getElementById(getTrackId());
          if (!trackEl) return;

          const onPointerMove = (moveEvent: PointerEvent) => {
            const position = getPositionFromPointer(trackEl, moveEvent.clientX, moveEvent.clientY);
            send({ type: "POINTER_MOVE", position });
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

    getValueTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.valueText,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
      };
    },

    getMarkerGroupProps() {
      return {
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.markerGroup,
        "data-orientation": ctx.orientation,
        role: "presentation",
      };
    },

    getMarkerProps(props) {
      const { value: markerValue } = props;
      const percent = getPercent(markerValue, ctx.min, ctx.max);
      const isInRange =
        ctx.value.length > 1
          ? markerValue >= ctx.value[0]! && markerValue <= ctx.value[ctx.value.length - 1]!
          : markerValue <= ctx.value[0]!;

      const style: Record<string, string> = {};
      if (isHorizontal) {
        style.left = `${percent}%`;
      } else {
        style.bottom = `${percent}%`;
      }
      style.position = "absolute";

      return {
        "data-scope": SCOPE,
        "data-part": sliderAnatomy.marker,
        "data-orientation": ctx.orientation,
        "data-value": markerValue,
        "data-state": isInRange ? "at-value" : "under-value",
        role: "presentation",
        style,
      };
    },
  };
}
