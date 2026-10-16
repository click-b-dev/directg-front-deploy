/**
 * Carousel 머신 타입 정의
 * WAI-ARIA Carousel 패턴
 */

export type CarouselState = "idle" | "autoPlaying" | "dragging";

export interface CarouselContext {
  /** 컴포넌트 고유 ID */
  id: string;
  /** 현재 슬라이드 인덱스 */
  index: number;
  /** 전체 슬라이드 수 */
  totalSlides: number;
  /** 순환 여부 */
  loop: boolean;
  /** 자동 재생 여부 */
  autoPlay: boolean;
  /** 자동 재생 간격 (ms) */
  autoPlayInterval: number;
  /** 방향 */
  orientation: "horizontal" | "vertical";
  /** 한 번에 보이는 슬라이드 수 */
  slidesPerView: number;
}

export type CarouselEvent =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO"; index: number }
  | { type: "AUTO_PLAY_TICK" }
  | { type: "AUTO_PLAY_START" }
  | { type: "AUTO_PLAY_PAUSE" }
  | { type: "DRAG_START"; startX: number; startY: number }
  | { type: "DRAG_END"; deltaX: number; deltaY: number }
  | { type: "SET_CONTEXT"; context: Partial<CarouselContext> };
