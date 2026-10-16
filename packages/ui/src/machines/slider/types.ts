/**
 * Slider 상태머신 타입 정의
 * WAI-ARIA Slider 패턴 — 단일/다중 thumb 지원
 */

/** Slider 상태 */
export type SliderState = "idle" | "dragging";

/** Slider 컨텍스트 */
export interface SliderContext {
  /** 현재 값 배열 (multi-thumb 지원) */
  value: number[];
  /** 최솟값 */
  min: number;
  /** 최댓값 */
  max: number;
  /** 증감 단위 */
  step: number;
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
  /** 현재 드래그 중인 thumb 인덱스 (-1이면 없음) */
  activeThumbIndex: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Slider 이벤트 */
export type SliderEvent =
  | { type: "THUMB_POINTER_DOWN"; index: number }
  | { type: "POINTER_MOVE"; position: number }
  | { type: "POINTER_UP" }
  | { type: "THUMB_KEY_DOWN"; index: number; key: string }
  | { type: "SET_VALUE"; value: number[] }
  | { type: "SET_CONTEXT"; context: Partial<SliderContext> };
