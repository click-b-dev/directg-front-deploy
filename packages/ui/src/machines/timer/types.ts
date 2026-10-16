/**
 * Timer 상태머신 타입 정의
 * Countdown/Countup 타이머
 */

/** Timer 상태 */
export type TimerState = "idle" | "running" | "paused";

/** 타이머 세그먼트 (표시용) */
export interface TimerSegments {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Timer 컨텍스트 */
export interface TimerContext {
  /** 시작 시간 (ms) */
  startMs: number;
  /** 카운트다운 모드 여부 */
  countdown: boolean;
  /** 자동 시작 여부 */
  autoStart: boolean;
  /** 타이머 간격 (ms, 기본 1000) */
  interval: number;
  /** 현재 경과/잔여 시간 (ms) */
  currentMs: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Timer 이벤트 */
export type TimerEvent =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK" }
  | { type: "SET_CONTEXT"; context: Partial<TimerContext> };
