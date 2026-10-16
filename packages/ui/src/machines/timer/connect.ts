/**
 * Timer connect — 머신 상태를 DOM 속성으로 변환
 */

import type { Send } from "@/machines/shared";
import type { TimerState, TimerContext, TimerEvent, TimerSegments } from "./types";
import { SCOPE, timerAnatomy } from "./anatomy";
import { msToSegments } from "./machine";

export type TimerAction = "start" | "pause" | "resume" | "reset";

export interface TimerApi {
  currentMs: number;
  segments: TimerSegments;
  state: TimerState;
  isRunning: boolean;
  isPaused: boolean;
  isIdle: boolean;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  getRootProps(): Record<string, unknown>;
  getAreaProps(): Record<string, unknown>;
  getControlProps(): Record<string, unknown>;
  getSeparatorProps(): Record<string, unknown>;
  getItemProps(props: { type: keyof TimerSegments }): Record<string, unknown>;
  getActionTriggerProps(props: { action: TimerAction }): Record<string, unknown>;
}

export function connect(state: TimerState, ctx: TimerContext, send: Send<TimerEvent>): TimerApi {
  const segments = msToSegments(ctx.currentMs);
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isIdle = state === "idle";

  return {
    currentMs: ctx.currentMs,
    segments,
    state,
    isRunning,
    isPaused,
    isIdle,

    start() {
      send({ type: "START" });
    },
    pause() {
      send({ type: "PAUSE" });
    },
    resume() {
      send({ type: "RESUME" });
    },
    reset() {
      send({ type: "RESET" });
    },

    getRootProps() {
      return {
        id: ctx.id,
        "data-scope": SCOPE,
        "data-part": timerAnatomy.root,
        "data-state": state,
        role: "timer",
        "aria-label": ctx.countdown ? "Countdown timer" : "Timer",
        "aria-live": "polite",
      };
    },

    getAreaProps() {
      return {
        "data-scope": SCOPE,
        "data-part": timerAnatomy.area,
        "data-state": state,
      };
    },

    getControlProps() {
      return {
        "data-scope": SCOPE,
        "data-part": timerAnatomy.control,
        "data-state": state,
      };
    },

    getSeparatorProps() {
      return {
        "data-scope": SCOPE,
        "data-part": timerAnatomy.separator,
        "aria-hidden": "true",
      };
    },

    getItemProps(props) {
      const { type } = props;
      const value = segments[type];

      return {
        "data-scope": SCOPE,
        "data-part": timerAnatomy.item,
        "data-type": type,
        "data-value": value,
      };
    },

    getActionTriggerProps(props) {
      const { action } = props;

      const actionMap: Record<TimerAction, () => void> = {
        start: () => send({ type: "START" }),
        pause: () => send({ type: "PAUSE" }),
        resume: () => send({ type: "RESUME" }),
        reset: () => send({ type: "RESET" }),
      };

      return {
        "data-scope": SCOPE,
        "data-part": timerAnatomy.actionTrigger,
        "data-action": action,
        "data-state": state,
        onClick: actionMap[action],
      };
    },
  };
}
