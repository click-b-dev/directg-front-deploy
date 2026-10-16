import type { Send } from "@/machines/shared/types";
import type { ProgressState, ProgressContext, ProgressEvent } from "./types";

export interface ProgressApi {
  /** 현재 상태 */
  state: ProgressState;
  /** 현재 값 */
  value: number | null;
  /** 퍼센트 (0-100), indeterminate일 경우 null */
  percent: number | null;
  /** 값 설정 */
  setValue(value: number | null): void;

  getRootProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getTrackProps(): Record<string, unknown>;
  getRangeProps(): Record<string, unknown>;
  getValueTextProps(): Record<string, unknown>;
  getViewProps(view: "linear" | "circular"): Record<string, unknown>;
  getCircleProps(): Record<string, unknown>;
  getCircleTrackProps(): Record<string, unknown>;
  getCircleRangeProps(): Record<string, unknown>;
}

export function connect(
  state: ProgressState,
  context: ProgressContext,
  send: Send<ProgressEvent>,
  ids: { root: string; label: string },
): ProgressApi {
  const { value, min, max } = context;
  const percent = value === null ? null : ((value - min) / (max - min)) * 100;
  const isIndeterminate = value === null;

  return {
    state,
    value,
    percent,

    setValue(v: number | null) {
      send({ type: "SET_VALUE", value: v });
    },

    getRootProps() {
      return {
        "data-scope": "progress",
        "data-part": "root",
        "data-state": state,
        id: ids.root,
        role: "progressbar",
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-valuenow": isIndeterminate ? undefined : value,
        "aria-valuetext": isIndeterminate ? undefined : `${Math.round(percent!)}%`,
        "aria-labelledby": ids.label,
      };
    },

    getLabelProps() {
      return {
        "data-scope": "progress",
        "data-part": "label",
        "data-state": state,
        id: ids.label,
      };
    },

    getTrackProps() {
      return {
        "data-scope": "progress",
        "data-part": "track",
        "data-state": state,
      };
    },

    getRangeProps() {
      return {
        "data-scope": "progress",
        "data-part": "range",
        "data-state": state,
        style: isIndeterminate ? undefined : { width: `${percent}%` },
      };
    },

    getValueTextProps() {
      return {
        "data-scope": "progress",
        "data-part": "valueText",
        "data-state": state,
      };
    },

    getViewProps(view: "linear" | "circular") {
      return {
        "data-scope": "progress",
        "data-part": "view",
        "data-state": state,
        "data-view": view,
      };
    },

    getCircleProps() {
      return {
        "data-scope": "progress",
        "data-part": "circle",
        "data-state": state,
      };
    },

    getCircleTrackProps() {
      return {
        "data-scope": "progress",
        "data-part": "circleTrack",
        "data-state": state,
      };
    },

    getCircleRangeProps() {
      const circumference = 2 * Math.PI * 45; // radius = 45 for viewBox 100x100
      const offset = isIndeterminate ? 0 : circumference - (circumference * (percent ?? 0)) / 100;
      return {
        "data-scope": "progress",
        "data-part": "circleRange",
        "data-state": state,
        style: {
          strokeDasharray: circumference,
          strokeDashoffset: offset,
        },
      };
    },
  };
}
