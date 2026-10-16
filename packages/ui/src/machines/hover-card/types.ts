/**
 * HoverCard 머신 타입 정의
 * Tooltip과 유사하지만 풍부한 콘텐츠를 제공하는 비모달 오버레이
 */

export type HoverCardState = "closed" | "opening" | "open" | "closing";

export interface HoverCardContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 열기 지연 시간 (ms) */
  openDelay: number;
  /** 닫기 지연 시간 (ms) */
  closeDelay: number;
}

export type HoverCardEvent =
  | { type: "POINTER_ENTER" }
  | { type: "POINTER_LEAVE" }
  | { type: "CONTENT_POINTER_ENTER" }
  | { type: "CONTENT_POINTER_LEAVE" }
  | { type: "OPEN_DELAY_COMPLETE" }
  | { type: "CLOSE_DELAY_COMPLETE" }
  | { type: "ESCAPE" }
  | { type: "OPEN" }
  | { type: "CLOSE" };
