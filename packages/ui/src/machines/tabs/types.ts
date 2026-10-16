/**
 * Tabs 상태머신 타입 정의
 * WAI-ARIA Tabs 패턴
 */

/** Tabs 상태 — 단일 상태 (idle) */
export type TabsState = "idle";

/** 개별 탭 아이템 */
export interface TabItem {
  value: string;
  disabled?: boolean;
}

/** Tabs 컨텍스트 */
export interface TabsContext {
  /** 현재 활성 탭 값 */
  value: string;
  /** 탭 목록 */
  items: TabItem[];
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 포커스된 탭 인덱스 */
  focusedIndex: number;
  /** 컴포넌트 고유 ID */
  id: string;
  /** 활성화 모드: automatic (포커스 시 활성화) 또는 manual (Enter/Space로 활성화) */
  activationMode: "automatic" | "manual";
}

/** Tabs 이벤트 */
export type TabsEvent =
  | { type: "TAB_FOCUS"; value: string }
  | { type: "TAB_CLICK"; value: string }
  | { type: "KEY_DOWN"; key: string }
  | { type: "SET_VALUE"; value: string }
  | { type: "SET_ITEMS"; items: TabItem[] }
  | { type: "SET_ORIENTATION"; orientation: "horizontal" | "vertical" };
