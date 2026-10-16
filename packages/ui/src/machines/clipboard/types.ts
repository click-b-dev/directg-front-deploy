/**
 * Clipboard 상태머신 타입 정의
 * 클립보드 복사 유틸리티
 */

/** Clipboard 상태 */
export type ClipboardState = "idle" | "copied";

/** Clipboard 컨텍스트 */
export interface ClipboardContext {
  /** 복사할 값 */
  value: string;
  /** 복사 완료 상태 표시 시간 (ms) */
  timeout: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Clipboard 이벤트 */
export type ClipboardEvent =
  | { type: "COPY" }
  | { type: "COPY_DONE" }
  | { type: "RESET" }
  | { type: "SET_VALUE"; value: string }
  | { type: "SET_CONTEXT"; context: Partial<ClipboardContext> };
