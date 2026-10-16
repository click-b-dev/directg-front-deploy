/**
 * Accordion 상태머신 타입 정의
 * WAI-ARIA Accordion 패턴
 */

/** Accordion 상태 — 단일 상태 */
export type AccordionState = "idle";

/** 개별 아코디언 아이템 */
export interface AccordionItem {
  value: string;
  disabled?: boolean;
}

/** Accordion 컨텍스트 */
export interface AccordionContext {
  /** 열려있는 아이템 값 목록 */
  value: string[];
  /** 아이템 목록 */
  items: AccordionItem[];
  /** 다중 열기 허용 여부 */
  multiple: boolean;
  /** 모든 아이템 접을 수 있는지 (single 모드에서) */
  collapsible: boolean;
  /** 현재 포커스된 트리거 인덱스 */
  focusedIndex: number;
  /** 컴포넌트 고유 ID */
  id: string;
  /** 방향 */
  orientation: "horizontal" | "vertical";
}

/** Accordion 이벤트 */
export type AccordionEvent =
  | { type: "ITEM_TOGGLE"; value: string }
  | { type: "TRIGGER_FOCUS"; value: string }
  | { type: "KEY_DOWN"; key: string }
  | { type: "SET_VALUE"; value: string[] }
  | { type: "SET_ITEMS"; items: AccordionItem[] };
