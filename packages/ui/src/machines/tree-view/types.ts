/**
 * TreeView 상태머신 타입 정의
 * WAI-ARIA Tree View 패턴
 */

/** TreeView 상태 */
export type TreeViewState = "idle" | "focused";

/** TreeView 컨텍스트 */
export interface TreeViewContext {
  /** 확장된 브랜치 ID 집합 */
  expandedIds: string[];
  /** 선택된 아이템 ID 집합 */
  selectedIds: string[];
  /** 현재 포커스된 아이템 ID */
  focusedId: string;
  /** 선택 모드 */
  selectionMode: "single" | "multiple";
  /** 컴포넌트 고유 ID */
  id: string;
  /** 전체 visible 아이템 ID 목록 (평면화된 순서) */
  visibleIds: string[];
  /** 아이템 부모-자식 관계 맵 (parentId -> childIds) */
  childrenMap: Record<string, string[]>;
  /** 아이템 -> 부모 맵 */
  parentMap: Record<string, string>;
  /** 브랜치인 아이템 ID 집합 */
  branchIds: string[];
}

/** TreeView 이벤트 */
export type TreeViewEvent =
  | { type: "ITEM_FOCUS"; id: string }
  | { type: "ITEM_SELECT"; id: string }
  | { type: "ITEM_CLICK"; id: string }
  | { type: "BRANCH_TOGGLE"; id: string }
  | { type: "KEY_DOWN"; key: string }
  | { type: "FOCUS_IN" }
  | { type: "FOCUS_OUT" }
  | { type: "SET_EXPANDED"; ids: string[] }
  | { type: "SET_SELECTED"; ids: string[] }
  | { type: "SET_VISIBLE_IDS"; ids: string[] }
  | {
      type: "REGISTER_TREE";
      childrenMap: Record<string, string[]>;
      parentMap: Record<string, string>;
      branchIds: string[];
      visibleIds: string[];
    }
  | { type: "EXPAND_SIBLINGS"; id: string };
