/**
 * Timer React 컴포넌트 타입 정의
 */

import type { ReactNode } from "react";
import type { TimerSegments } from "@/machines/timer/types";
import type { TimerAction } from "@/machines/timer/connect";

export interface TimerRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 시작 시간 (ms) */
  startMs?: number;
  /** 카운트다운 모드 */
  countdown?: boolean;
  /** 자동 시작 */
  autoStart?: boolean;
  /** 타이머 간격 (ms, 기본 1000) */
  interval?: number;
  /** 카운트다운 완료 콜백 */
  onComplete?: () => void;
  children?: ReactNode;
}

export interface TimerAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TimerControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export type TimerSeparatorProps = React.HTMLAttributes<HTMLSpanElement>;

export interface TimerItemProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** 세그먼트 타입 */
  type: keyof TimerSegments;
  children?: ((value: number) => ReactNode) | ReactNode;
}

export interface TimerActionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 액션 타입 */
  action: TimerAction;
  children?: ReactNode;
}

export interface TimerContextValue {
  segments: TimerSegments;
  state: "idle" | "running" | "paused";
  getAreaProps: () => Record<string, unknown>;
  getControlProps: () => Record<string, unknown>;
  getSeparatorProps: () => Record<string, unknown>;
  getItemProps: (props: { type: keyof TimerSegments }) => Record<string, unknown>;
  getActionTriggerProps: (props: { action: TimerAction }) => Record<string, unknown>;
}
