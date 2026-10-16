/**
 * Menu 머신 타입 정의
 * WAI-ARIA Menu + MenuButton 패턴
 */

export type MenuState = "closed" | "open";

export interface MenuContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 현재 하이라이트된 아이템 ID */
  highlightedId: string | null;
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 비활성 아이템 ID 목록 */
  disabledIds: Set<string>;
  /** 등록된 아이템 ID 목록 (순서 보장) */
  itemIds: string[];
  /** typeahead 검색 문자열 */
  typeahead: string;
}

export type MenuEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "OPEN_AND_HIGHLIGHT_FIRST" }
  | { type: "OPEN_AND_HIGHLIGHT_LAST" }
  | { type: "HIGHLIGHT"; id: string | null }
  | { type: "HIGHLIGHT_NEXT" }
  | { type: "HIGHLIGHT_PREV" }
  | { type: "HIGHLIGHT_FIRST" }
  | { type: "HIGHLIGHT_LAST" }
  | { type: "SELECT_HIGHLIGHTED" }
  | { type: "TYPEAHEAD"; key: string }
  | { type: "REGISTER_ITEM"; id: string; disabled?: boolean }
  | { type: "UNREGISTER_ITEM"; id: string };
