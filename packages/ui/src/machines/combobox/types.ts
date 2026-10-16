/**
 * Combobox 상태머신 타입 정의
 * WAI-ARIA Combobox 패턴 (Input + Listbox)
 */

/** Combobox 상태: 열림/닫힘 */
export type ComboboxState = "closed" | "open";

/** 개별 선택 아이템 */
export interface ComboboxItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/** 아이템 그룹 */
export interface ComboboxItemGroup {
  label: string;
  items: ComboboxItem[];
}

/** Combobox 컨텍스트 */
export interface ComboboxContext {
  /** 현재 선택된 값 (단일 또는 다중) */
  value: string[];
  /** input에 표시되는 텍스트 */
  inputValue: string;
  /** 현재 하이라이트된 아이템 값 */
  highlightedValue: string;
  /** 전체 아이템 목록 */
  items: ComboboxItem[];
  /** 필터링된 아이템 목록 */
  filteredItems: ComboboxItem[];
  /** 컴포넌트 고유 ID */
  id: string;
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
  /** 다중 선택 */
  multiple: boolean;
  /** 자동완성 모드 */
  autoComplete: "none" | "list" | "both" | "inline";
  /** 입력 시 자동으로 목록 열기 */
  openOnInput: boolean;
  /** type-ahead 검색 버퍼 */
  typeaheadBuffer: string;
  /** 포커스 관리를 위한 네비게이션 모드 */
  navigationMode: "input" | "list";
}

/** Combobox 이벤트 */
export type ComboboxEvent =
  | { type: "INPUT_FOCUS" }
  | { type: "INPUT_BLUR" }
  | { type: "INPUT_CHANGE"; value: string }
  | { type: "INPUT_KEY_DOWN"; key: string }
  | { type: "TRIGGER_CLICK" }
  | { type: "CLEAR_CLICK" }
  | { type: "ITEM_CLICK"; value: string }
  | { type: "ITEM_HOVER"; value: string }
  | { type: "CLOSE" }
  | { type: "SET_VALUE"; value: string[] }
  | { type: "SET_INPUT_VALUE"; value: string }
  | { type: "SET_ITEMS"; items: ComboboxItem[] }
  | { type: "SET_FILTERED_ITEMS"; items: ComboboxItem[] }
  | { type: "TYPEAHEAD"; key: string }
  | { type: "CLEAR_TYPEAHEAD" };
