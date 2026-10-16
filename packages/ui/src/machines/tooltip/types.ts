/**
 * Tooltip 머신 타입 정의
 * WAI-ARIA Tooltip 패턴
 */

export type TooltipState = "closed" | "opening" | "open" | "closing";

export interface TooltipContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 열기 지연 시간 (ms) */
  openDelay: number;
  /** 닫기 지연 시간 (ms) */
  closeDelay: number;
  /** 비활성 여부 */
  disabled: boolean;
}

export type TooltipEvent =
  | { type: "POINTER_ENTER" }
  | { type: "POINTER_LEAVE" }
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "OPEN_DELAY_COMPLETE" }
  | { type: "CLOSE_DELAY_COMPLETE" }
  | { type: "ESCAPE" }
  | { type: "OPEN" }
  | { type: "CLOSE" };
