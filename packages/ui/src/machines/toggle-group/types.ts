/**
 * ToggleGroup 상태머신 타입 정의
 * WAI-ARIA: 로빙 탭인덱스를 가진 토글 버튼 그룹
 */

/** ToggleGroup 상태 — 단일 상태 */
export type ToggleGroupState = "idle";

/** ToggleGroup 컨텍스트 */
export interface ToggleGroupContext {
  /** 활성화된 아이템 값 목록 */
  value: string[];
  /** 단일/다중 모드 */
  multiple: boolean;
  /** 비활성화 */
  disabled: boolean;
  /** 현재 포커스된 아이템 인덱스 */
  focusedIndex: number;
  /** 등록된 아이템 값 목록 */
  items: string[];
  /** 비활성화된 아이템 값 목록 */
  disabledItems: string[];
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 순환 탐색 여부 */
  loop: boolean;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** ToggleGroup 이벤트 */
export type ToggleGroupEvent =
  | { type: "ITEM_TOGGLE"; value: string }
  | { type: "ITEM_FOCUS"; index: number }
  | { type: "KEY_DOWN"; key: string }
  | { type: "SET_VALUE"; value: string[] }
  | { type: "SET_ITEMS"; items: string[]; disabledItems: string[] };
