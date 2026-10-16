/**
 * Carousel 상태머신
 * WAI-ARIA Carousel 패턴의 슬라이드 탐색, 자동 재생, 드래그를 관리한다.
 *
 * States:
 *   idle ─AUTO_PLAY_START──→ autoPlaying
 *   idle ─DRAG_START──→ dragging
 *   autoPlaying ─AUTO_PLAY_PAUSE──→ idle
 *   autoPlaying ─AUTO_PLAY_TICK──→ autoPlaying (다음 슬라이드)
 *   autoPlaying ─DRAG_START──→ dragging
 *   dragging ─DRAG_END──→ idle | autoPlaying
 */

import type { TransitionResult } from "@/machines/shared/types";
import type { CarouselState, CarouselContext, CarouselEvent } from "./types";

function resolveIndex(index: number, total: number, loop: boolean): number {
  if (total === 0) return 0;
  if (loop) {
    return ((index % total) + total) % total;
  }
  return Math.max(0, Math.min(index, total - 1));
}

function goNext(ctx: CarouselContext): CarouselContext {
  const nextIndex = resolveIndex(ctx.index + 1, ctx.totalSlides, ctx.loop);
  return { ...ctx, index: nextIndex };
}

function goPrev(ctx: CarouselContext): CarouselContext {
  const prevIndex = resolveIndex(ctx.index - 1, ctx.totalSlides, ctx.loop);
  return { ...ctx, index: prevIndex };
}

function canGoNext(ctx: CarouselContext): boolean {
  if (ctx.loop) return true;
  return ctx.index < ctx.totalSlides - 1;
}

function canGoPrev(ctx: CarouselContext): boolean {
  if (ctx.loop) return true;
  return ctx.index > 0;
}

export function transition(
  state: CarouselState,
  ctx: CarouselContext,
  event: CarouselEvent,
): TransitionResult<CarouselState, CarouselContext> {
  // 공통 이벤트
  if (event.type === "SET_CONTEXT") {
    return { state, context: { ...ctx, ...event.context } };
  }

  if (event.type === "NEXT") {
    if (!canGoNext(ctx)) return { state, context: ctx };
    const nextCtx = goNext(ctx);
    return {
      state,
      context: nextCtx,
      effects: [{ type: "announce", message: `Slide ${nextCtx.index + 1} of ${ctx.totalSlides}` }],
    };
  }

  if (event.type === "PREV") {
    if (!canGoPrev(ctx)) return { state, context: ctx };
    const nextCtx = goPrev(ctx);
    return {
      state,
      context: nextCtx,
      effects: [{ type: "announce", message: `Slide ${nextCtx.index + 1} of ${ctx.totalSlides}` }],
    };
  }

  if (event.type === "GO_TO") {
    const nextIndex = resolveIndex(event.index, ctx.totalSlides, ctx.loop);
    if (nextIndex === ctx.index) return { state, context: ctx };
    return {
      state,
      context: { ...ctx, index: nextIndex },
      effects: [{ type: "announce", message: `Slide ${nextIndex + 1} of ${ctx.totalSlides}` }],
    };
  }

  switch (state) {
    case "idle": {
      if (event.type === "AUTO_PLAY_START" && ctx.autoPlay) {
        return { state: "autoPlaying", context: ctx };
      }
      if (event.type === "DRAG_START") {
        return { state: "dragging", context: ctx };
      }
      return { state, context: ctx };
    }

    case "autoPlaying": {
      if (event.type === "AUTO_PLAY_TICK") {
        const nextCtx = goNext(ctx);
        return { state: "autoPlaying", context: nextCtx };
      }
      if (event.type === "AUTO_PLAY_PAUSE") {
        return { state: "idle", context: ctx };
      }
      if (event.type === "DRAG_START") {
        return { state: "dragging", context: ctx };
      }
      return { state, context: ctx };
    }

    case "dragging": {
      if (event.type === "DRAG_END") {
        const threshold = 50;
        const delta = ctx.orientation === "horizontal" ? event.deltaX : event.deltaY;

        let nextCtx = ctx;
        if (delta < -threshold && canGoNext(ctx)) {
          nextCtx = goNext(ctx);
        } else if (delta > threshold && canGoPrev(ctx)) {
          nextCtx = goPrev(ctx);
        }

        const nextState: CarouselState = ctx.autoPlay ? "autoPlaying" : "idle";
        return { state: nextState, context: nextCtx };
      }
      return { state, context: ctx };
    }

    default:
      return { state, context: ctx };
  }
}

export function createCarouselMachine(ctx: Partial<CarouselContext> & { id: string }) {
  const initialContext: CarouselContext = {
    id: ctx.id,
    index: ctx.index ?? 0,
    totalSlides: ctx.totalSlides ?? 0,
    loop: ctx.loop ?? false,
    autoPlay: ctx.autoPlay ?? false,
    autoPlayInterval: ctx.autoPlayInterval ?? 4000,
    orientation: ctx.orientation ?? "horizontal",
    slidesPerView: ctx.slidesPerView ?? 1,
  };

  const initialState: CarouselState = initialContext.autoPlay ? "autoPlaying" : "idle";

  return {
    initialState,
    initialContext,
    transition,
  };
}
