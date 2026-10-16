/**
 * FloatingPanel 머신 타입 정의
 * 드래그 가능/리사이즈 가능한 패널 (Dialog 변형)
 */

export type FloatingPanelState =
  | "closed"
  | "open"
  | "dragging"
  | "resizing"
  | "minimized"
  | "maximized";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface FloatingPanelContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 패널 위치 */
  position: Position;
  /** 패널 크기 */
  size: Size;
  /** 최소 크기 */
  minSize: Size;
  /** 최대 크기 */
  maxSize: Size;
  /** 드래그 시작 시의 포인터 위치 */
  dragStart: Position;
  /** 드래그 시작 시의 패널 위치 */
  positionAtDragStart: Position;
  /** 리사이즈 시작 시의 포인터 위치 */
  resizeStart: Position;
  /** 리사이즈 시작 시의 패널 크기 */
  sizeAtResizeStart: Size;
  /** 리사이즈 방향 */
  resizeDirection: string;
  /** 최소화 전 위치/크기 저장 */
  prevPosition: Position;
  /** 최소화 전 크기 저장 */
  prevSize: Size;
}

export type FloatingPanelEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "DRAG_START"; pointerX: number; pointerY: number }
  | { type: "DRAG_MOVE"; pointerX: number; pointerY: number }
  | { type: "DRAG_END" }
  | { type: "RESIZE_START"; pointerX: number; pointerY: number; direction: string }
  | { type: "RESIZE_MOVE"; pointerX: number; pointerY: number }
  | { type: "RESIZE_END" }
  | { type: "MINIMIZE" }
  | { type: "MAXIMIZE" }
  | { type: "RESTORE" }
  | { type: "SET_POSITION"; position: Position }
  | { type: "SET_SIZE"; size: Size }
  | { type: "SET_CONTEXT"; context: Partial<FloatingPanelContext> };
