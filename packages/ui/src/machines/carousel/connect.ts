/**
 * Carousel connect
 * 머신 상태를 WAI-ARIA Carousel 패턴의 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { dataAttr, ariaAttr } from "@/machines/shared/dom";
import { Keys, isKey } from "@/machines/shared/keyboard";
import type { CarouselState, CarouselContext, CarouselEvent } from "./types";

export interface CarouselConnectReturn {
  /** 현재 슬라이드 인덱스 */
  index: number;
  /** 자동 재생 중 여부 */
  isAutoPlaying: boolean;
  /** 이전 슬라이드 이동 가능 여부 */
  canGoPrev: boolean;
  /** 다음 슬라이드 이동 가능 여부 */
  canGoNext: boolean;
  /** 다음 슬라이드로 이동 */
  scrollNext(): void;
  /** 이전 슬라이드로 이동 */
  scrollPrev(): void;
  /** 특정 슬라이드로 이동 */
  scrollTo(index: number): void;
  /** root 속성 */
  rootProps: {
    "data-scope": string;
    "data-part": string;
    "data-orientation": "horizontal" | "vertical";
    id: string;
    role: "region";
    "aria-roledescription": "carousel";
    "aria-label": string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocusCapture: () => void;
    onBlurCapture: () => void;
  };
  /** viewport 속성 */
  viewportProps: {
    "data-scope": string;
    "data-part": string;
    "data-orientation": "horizontal" | "vertical";
    id: string;
  };
  /** itemGroup 속성 */
  itemGroupProps: {
    "data-scope": string;
    "data-part": string;
    "data-orientation": "horizontal" | "vertical";
    id: string;
    "aria-live": "off" | "polite";
  };
  /** 개별 item props 반환 */
  getItemProps(props: { index: number }): {
    "data-scope": string;
    "data-part": string;
    "data-current": "" | undefined;
    id: string;
    role: "group";
    "aria-roledescription": "slide";
    "aria-label": string;
    "aria-hidden": "true" | "false";
  };
  /** prevTrigger 속성 */
  prevTriggerProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
    type: "button";
    "aria-label": string;
    "aria-controls": string;
    disabled: boolean;
    onClick: () => void;
  };
  /** nextTrigger 속성 */
  nextTriggerProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
    type: "button";
    "aria-label": string;
    "aria-controls": string;
    disabled: boolean;
    onClick: () => void;
  };
  /** indicatorGroup 속성 */
  indicatorGroupProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
    role: "tablist";
  };
  /** 개별 indicator props 반환 */
  getIndicatorProps(props: { index: number }): {
    "data-scope": string;
    "data-part": string;
    "data-current": "" | undefined;
    id: string;
    role: "tab";
    "aria-label": string;
    "aria-selected": "true" | "false";
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** autoplayTrigger 속성 */
  autoplayTriggerProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": "playing" | "paused";
    id: string;
    type: "button";
    "aria-label": string;
    onClick: () => void;
  };
}

export function connectCarousel(
  state: CarouselState,
  context: CarouselContext,
  send: Send<CarouselEvent>,
): CarouselConnectReturn {
  const isAutoPlaying = state === "autoPlaying";
  const canGoPrev = context.loop || context.index > 0;
  const canGoNext = context.loop || context.index < context.totalSlides - 1;

  const rootId = context.id;
  const viewportId = `${context.id}-viewport`;
  const itemGroupId = `${context.id}-item-group`;
  const indicatorGroupId = `${context.id}-indicator-group`;

  return {
    index: context.index,
    isAutoPlaying,
    canGoPrev,
    canGoNext,
    scrollNext() {
      send({ type: "NEXT" });
    },
    scrollPrev() {
      send({ type: "PREV" });
    },
    scrollTo(index: number) {
      send({ type: "GO_TO", index });
    },
    rootProps: {
      "data-scope": "carousel",
      "data-part": "root",
      "data-orientation": context.orientation,
      id: rootId,
      role: "region",
      "aria-roledescription": "carousel",
      "aria-label": "Carousel",
      onMouseEnter() {
        if (isAutoPlaying) send({ type: "AUTO_PLAY_PAUSE" });
      },
      onMouseLeave() {
        if (context.autoPlay && !isAutoPlaying) send({ type: "AUTO_PLAY_START" });
      },
      onFocusCapture() {
        if (isAutoPlaying) send({ type: "AUTO_PLAY_PAUSE" });
      },
      onBlurCapture() {
        if (context.autoPlay && !isAutoPlaying) send({ type: "AUTO_PLAY_START" });
      },
    },
    viewportProps: {
      "data-scope": "carousel",
      "data-part": "viewport",
      "data-orientation": context.orientation,
      id: viewportId,
    },
    itemGroupProps: {
      "data-scope": "carousel",
      "data-part": "item-group",
      "data-orientation": context.orientation,
      id: itemGroupId,
      "aria-live": isAutoPlaying ? "off" : "polite",
    },
    getItemProps(props: { index: number }) {
      const isCurrent = props.index === context.index;
      const isVisible =
        props.index >= context.index && props.index < context.index + context.slidesPerView;

      return {
        "data-scope": "carousel" as const,
        "data-part": "item" as const,
        "data-current": dataAttr(isCurrent),
        id: `${context.id}-item-${props.index}`,
        role: "group" as const,
        "aria-roledescription": "slide" as const,
        "aria-label": `Slide ${props.index + 1} of ${context.totalSlides}`,
        "aria-hidden": ariaAttr(!isVisible),
      };
    },
    prevTriggerProps: {
      "data-scope": "carousel",
      "data-part": "prev-trigger",
      id: `${context.id}-prev-trigger`,
      type: "button",
      "aria-label": "Previous slide",
      "aria-controls": itemGroupId,
      disabled: !canGoPrev,
      onClick() {
        send({ type: "PREV" });
      },
    },
    nextTriggerProps: {
      "data-scope": "carousel",
      "data-part": "next-trigger",
      id: `${context.id}-next-trigger`,
      type: "button",
      "aria-label": "Next slide",
      "aria-controls": itemGroupId,
      disabled: !canGoNext,
      onClick() {
        send({ type: "NEXT" });
      },
    },
    indicatorGroupProps: {
      "data-scope": "carousel",
      "data-part": "indicator-group",
      id: indicatorGroupId,
      role: "tablist",
    },
    getIndicatorProps(props: { index: number }) {
      const isCurrent = props.index === context.index;

      return {
        "data-scope": "carousel" as const,
        "data-part": "indicator" as const,
        "data-current": dataAttr(isCurrent),
        id: `${context.id}-indicator-${props.index}`,
        role: "tab" as const,
        "aria-label": `Go to slide ${props.index + 1}`,
        "aria-selected": ariaAttr(isCurrent),
        tabIndex: isCurrent ? 0 : -1,
        onClick() {
          send({ type: "GO_TO", index: props.index });
        },
        onKeyDown(e: React.KeyboardEvent) {
          if (isKey(e.key, Keys.ArrowLeft, Keys.ArrowUp)) {
            e.preventDefault();
            const prev = props.index <= 0 ? context.totalSlides - 1 : props.index - 1;
            const el = document.getElementById(`${context.id}-indicator-${prev}`);
            el?.focus();
          }
          if (isKey(e.key, Keys.ArrowRight, Keys.ArrowDown)) {
            e.preventDefault();
            const next = props.index >= context.totalSlides - 1 ? 0 : props.index + 1;
            const el = document.getElementById(`${context.id}-indicator-${next}`);
            el?.focus();
          }
          if (isKey(e.key, Keys.Home)) {
            e.preventDefault();
            document.getElementById(`${context.id}-indicator-0`)?.focus();
          }
          if (isKey(e.key, Keys.End)) {
            e.preventDefault();
            document.getElementById(`${context.id}-indicator-${context.totalSlides - 1}`)?.focus();
          }
        },
      };
    },
    autoplayTriggerProps: {
      "data-scope": "carousel",
      "data-part": "autoplay-trigger",
      "data-state": isAutoPlaying ? "playing" : "paused",
      id: `${context.id}-autoplay-trigger`,
      type: "button",
      "aria-label": isAutoPlaying ? "Pause autoplay" : "Start autoplay",
      onClick() {
        if (isAutoPlaying) {
          send({ type: "AUTO_PLAY_PAUSE" });
        } else {
          send({ type: "AUTO_PLAY_START" });
        }
      },
    },
  };
}
