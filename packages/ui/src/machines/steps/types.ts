/**
 * Steps 상태머신 타입 정의
 * WAI-ARIA: Sequential step indicator (Tabs 변형)
 */

/** Steps 상태: 단일 상태 */
export type StepsState = "idle";

/** Steps 컨텍스트 */
export interface StepsContext {
  /** 현재 스텝 (0-based) */
  step: number;
  /** 전체 스텝 수 */
  count: number;
  /** 순차 모드 (true: 이전/다음만 가능, false: 자유 이동) */
  linear: boolean;
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Steps 이벤트 */
export type StepsEvent =
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_COUNT"; count: number }
  | { type: "TRIGGER_CLICK"; step: number };
