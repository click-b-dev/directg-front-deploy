/**
 * Dialog 머신 타입 정의
 * WAI-ARIA Dialog (Modal) 패턴
 */

export type DialogState = "open" | "closed";

export interface DialogContext {
  /** 컴포넌트 고유 ID */
  id: string;
}

export type DialogEvent = { type: "OPEN" } | { type: "CLOSE" } | { type: "TOGGLE" };
