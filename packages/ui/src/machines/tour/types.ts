/**
 * Tour 상태머신 타입 정의
 * Step-by-step guided tour 패턴
 */

/** Tour 상태 */
export type TourState = "closed" | "open";

/** Tour 스텝 정의 */
export interface TourStep {
  /** 타겟 요소 CSS 선택자 */
  target: string;
  /** 스텝 제목 */
  title: string;
  /** 스텝 설명 */
  description: string;
}

/** Tour 컨텍스트 */
export interface TourContext {
  /** 스텝 배열 */
  steps: TourStep[];
  /** 현재 스텝 인덱스 */
  currentStep: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Tour 이벤트 */
export type TourEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO"; step: number }
  | { type: "SET_CONTEXT"; context: Partial<TourContext> };
