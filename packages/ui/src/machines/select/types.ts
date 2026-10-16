/**
 * Select 상태머신 타입 정의
 * WAI-ARIA Listbox 패턴 (single select dropdown)
 */

/** Select 상태: 열림/닫힘 */
export type SelectState = "closed" | "open";

/** 개별 선택 아이템 */
export interface SelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Select 컨텍스트 */
export interface SelectContext {
  /** 현재 선택된 값 */
  value: string;
  /** 아이템 목록 */
  items: SelectItem[];
  /** 현재 하이라이트된 아이템 인덱스 (-1이면 없음) */
  highlightedIndex: number;
  /** 컴포넌트 고유 ID */
  id: string;
  /** type-ahead 검색 버퍼 */
  typeaheadBuffer: string;
  /** 선택 아이템의 레이블 */
  valueLabel: string;
}

/** Select 이벤트 */
export type SelectEvent =
  | { type: "TRIGGER_CLICK" }
  | { type: "TRIGGER_KEY_DOWN"; key: string }
  | { type: "OPTION_CLICK"; value: string }
  | { type: "OPTION_HOVER"; index: number }
  | { type: "CONTENT_KEY_DOWN"; key: string }
  | { type: "CLOSE" }
  | { type: "SET_VALUE"; value: string }
  | { type: "SET_ITEMS"; items: SelectItem[] }
  | { type: "TYPEAHEAD"; key: string }
  | { type: "CLEAR_TYPEAHEAD" };
