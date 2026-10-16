/**
 * Popover 머신 타입 정의
 * WAI-ARIA Popover (non-modal dialog) 패턴
 */

export type PopoverState = "open" | "closed";

export interface PopoverContext {
  /** 컴포넌트 고유 ID */
  id: string;
}

export type PopoverEvent = { type: "OPEN" } | { type: "CLOSE" } | { type: "TOGGLE" };
