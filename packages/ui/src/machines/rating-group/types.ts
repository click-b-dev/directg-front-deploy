/**
 * RatingGroup 상태머신 타입 정의
 * WAI-ARIA: Radio group 변형 — 별점 평가
 */

/** RatingGroup 상태 */
export type RatingGroupState = "idle" | "hovering";

/** RatingGroup 컨텍스트 */
export interface RatingGroupContext {
  /** 현재 선택된 값 */
  value: number;
  /** 별 개수 */
  count: number;
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
  /** 반값 허용 */
  allowHalf: boolean;
  /** 현재 호버 중인 값 (-1이면 호버 없음) */
  hoveredValue: number;
  /** 폼 필드 이름 */
  name?: string;
  /** 필수 입력 */
  required: boolean;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** RatingGroup 이벤트 */
export type RatingGroupEvent =
  | { type: "SET_VALUE"; value: number }
  | { type: "HOVER"; value: number }
  | { type: "HOVER_END" }
  | { type: "KEY_DOWN"; key: string }
  | { type: "SET_CONTEXT"; context: Partial<RatingGroupContext> };
