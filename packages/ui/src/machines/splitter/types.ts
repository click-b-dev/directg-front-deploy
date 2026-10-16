/**
 * Splitter 상태머신 타입 정의
 * WAI-ARIA Window Splitter 패턴 — 리사이즈 가능한 패널
 */

/** Splitter 상태 */
export type SplitterState = "idle" | "dragging";

/** 개별 패널 사이즈 제약 */
export interface PanelConstraint {
  /** 최소 크기 (%) */
  min: number;
  /** 최대 크기 (%) */
  max: number;
  /** 접힌 상태 크기 (%, 기본 0) */
  collapsedSize: number;
  /** 접기 가능 여부 */
  collapsible: boolean;
}

/** Splitter 컨텍스트 */
export interface SplitterContext {
  /** 각 패널 크기 (%) */
  sizes: number[];
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 비활성화 */
  disabled: boolean;
  /** 패널 제약 조건 */
  panels: PanelConstraint[];
  /** 현재 드래그 중인 핸들 인덱스 (-1이면 없음) */
  activeHandleIndex: number;
  /** 키보드 리사이즈 단위 (%, 기본 1) */
  step: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Splitter 이벤트 */
export type SplitterEvent =
  | { type: "HANDLE_POINTER_DOWN"; index: number }
  | { type: "POINTER_MOVE"; delta: number }
  | { type: "POINTER_UP" }
  | { type: "HANDLE_KEY_DOWN"; index: number; key: string }
  | { type: "HANDLE_DOUBLE_CLICK"; index: number }
  | { type: "SET_SIZES"; sizes: number[] }
  | { type: "SET_CONTEXT"; context: Partial<SplitterContext> };
