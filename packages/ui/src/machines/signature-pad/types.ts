/**
 * SignaturePad 머신 타입 정의
 * Canvas 기반 서명 입력 패턴
 */

export type SignaturePadState = "idle" | "drawing";

/** 단일 경로(획)를 구성하는 점 */
export interface PathPoint {
  x: number;
  y: number;
  pressure: number;
}

/** 단일 획 (포인터 down → up까지) */
export type StrokePath = PathPoint[];

export interface SignaturePadContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 모든 획 데이터 */
  paths: StrokePath[];
  /** 현재 그리는 중인 획 */
  currentPath: StrokePath;
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
}

export type SignaturePadEvent =
  | { type: "DRAW_START"; point: PathPoint }
  | { type: "DRAW_MOVE"; point: PathPoint }
  | { type: "DRAW_END" }
  | { type: "CLEAR" }
  | { type: "SET_CONTEXT"; context: Partial<SignaturePadContext> };
