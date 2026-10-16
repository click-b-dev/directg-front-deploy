/**
 * Collapsible 머신 타입 정의
 * WAI-ARIA Disclosure 패턴
 */

export type CollapsibleState = "open" | "closed";

export interface CollapsibleContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 비활성화 여부 */
  disabled: boolean;
}

export type CollapsibleEvent = { type: "TOGGLE" } | { type: "OPEN" } | { type: "CLOSE" };
