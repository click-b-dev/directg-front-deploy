export type NavigationMenuState = "idle" | "open";

export interface NavigationMenuItem {
  value: string;
  disabled?: boolean;
}

export interface NavigationMenuContext {
  /** 현재 열려 있는 메뉴 값 (null이면 모두 닫힘) */
  value: string | null;
  /** 메뉴 아이템 목록 */
  items: NavigationMenuItem[];
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 포커스된 아이템 인덱스 */
  focusedIndex: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

export type NavigationMenuEvent =
  | { type: "TRIGGER_CLICK"; value: string }
  | { type: "TRIGGER_HOVER"; value: string }
  | { type: "TRIGGER_LEAVE" }
  | { type: "CONTENT_HOVER" }
  | { type: "CONTENT_LEAVE" }
  | { type: "KEY_DOWN"; key: string }
  | { type: "ESCAPE" }
  | { type: "SET_VALUE"; value: string | null }
  | { type: "SET_ITEMS"; items: NavigationMenuItem[] }
  | { type: "SET_ORIENTATION"; orientation: "horizontal" | "vertical" }
  | { type: "FOCUS_TRIGGER"; value: string };
