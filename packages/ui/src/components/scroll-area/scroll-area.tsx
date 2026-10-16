import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useId } from "@/hooks/use-id";
import { mergeProps } from "@/machines/shared";
import type {
  ScrollAreaRootProps,
  ScrollAreaViewportProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaCornerProps,
} from "./scroll-area.types";

interface ScrollAreaContextValue {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  viewportId: string;
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
  onScroll(): void;
}

const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null);

const useScrollAreaContext = (): ScrollAreaContextValue => {
  const ctx = useContext(ScrollAreaContext);
  if (!ctx) {
    throw new Error("ScrollArea compound components must be used within ScrollArea.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, ScrollAreaRootProps>((props, ref) => {
  const { children, id: customId, ...restProps } = props;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId(customId);
  const viewportId = `${baseId}-viewport`;

  const [scrollState, setScrollState] = useState({
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    clientHeight: 0,
    clientWidth: 0,
  });

  const onScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setScrollState({
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft,
      scrollHeight: el.scrollHeight,
      scrollWidth: el.scrollWidth,
      clientHeight: el.clientHeight,
      clientWidth: el.clientWidth,
    });
  }, []);

  // 초기 크기 측정
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  const rootProps: Record<string, unknown> = {
    "data-scope": "scroll-area",
    "data-part": "root",
    id: baseId,
    style: { position: "relative", overflow: "hidden" },
  };

  return (
    <ScrollAreaContext.Provider value={{ viewportRef, viewportId, ...scrollState, onScroll }}>
      <div ref={ref} {...mergeProps(rootProps, restProps)}>
        {children}
      </div>
    </ScrollAreaContext.Provider>
  );
});

const Viewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>((props, ref) => {
  const { children, ...restProps } = props;
  const ctx = useScrollAreaContext();

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (ctx.viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ctx.viewportRef, ref],
  );

  const viewportProps: Record<string, unknown> = {
    "data-scope": "scroll-area",
    "data-part": "viewport",
    id: ctx.viewportId,
    style: {
      overflow: "scroll",
      width: "100%",
      height: "100%",
      /* 네이티브 스크롤바 숨김 - CSS로도 오버라이드 가능 */
      scrollbarWidth: "none",
    },
    onScroll: ctx.onScroll,
  };

  return (
    <div ref={mergedRef} {...mergeProps(viewportProps, restProps)}>
      {children}
    </div>
  );
});

const Scrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>((props, ref) => {
  const { orientation = "vertical", children, ...restProps } = props;
  const ctx = useScrollAreaContext();
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const isVertical = orientation === "vertical";
  const totalSize = isVertical ? ctx.scrollHeight : ctx.scrollWidth;
  const viewportSize = isVertical ? ctx.clientHeight : ctx.clientWidth;
  const scrollOffset = isVertical ? ctx.scrollTop : ctx.scrollLeft;

  const ratio = viewportSize / totalSize;
  const shouldHide = ratio >= 1;

  // 값 정규화 (0-1 범위)
  const valueNow = totalSize > viewportSize ? scrollOffset / (totalSize - viewportSize) : 0;

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      const viewport = ctx.viewportRef.current;
      if (!track || !viewport) return;

      const rect = track.getBoundingClientRect();
      const clickPos = isVertical ? e.clientY - rect.top : e.clientX - rect.left;
      const trackSize = isVertical ? rect.height : rect.width;
      const ratio = clickPos / trackSize;

      if (isVertical) {
        viewport.scrollTop = ratio * (viewport.scrollHeight - viewport.clientHeight);
      } else {
        viewport.scrollLeft = ratio * (viewport.scrollWidth - viewport.clientWidth);
      }
    },
    [isVertical, ctx.viewportRef],
  );

  const mergedTrackRef = useCallback(
    (node: HTMLDivElement | null) => {
      trackRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  if (shouldHide) return null;

  const scrollbarProps: Record<string, unknown> = {
    "data-scope": "scroll-area",
    "data-part": "scrollbar",
    "data-orientation": orientation,
    role: "scrollbar",
    "aria-controls": ctx.viewportId,
    "aria-orientation": orientation,
    "aria-valuenow": Math.round(valueNow * 100),
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    onClick: handleTrackClick,
  };

  return (
    <ScrollbarThumbContext.Provider value={{ orientation, ratio, valueNow, thumbRef }}>
      <div ref={mergedTrackRef} {...mergeProps(scrollbarProps, restProps)}>
        {children}
      </div>
    </ScrollbarThumbContext.Provider>
  );
});

interface ScrollbarThumbContextValue {
  orientation: "vertical" | "horizontal";
  ratio: number;
  valueNow: number;
  thumbRef: React.RefObject<HTMLDivElement | null>;
}

const ScrollbarThumbContext = createContext<ScrollbarThumbContextValue | null>(null);

const Thumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>((props, ref) => {
  const thumbCtx = useContext(ScrollbarThumbContext);
  const scrollCtx = useScrollAreaContext();

  if (!thumbCtx) {
    throw new Error("ScrollArea.Thumb must be used within ScrollArea.Scrollbar");
  }

  const { orientation, ratio, valueNow } = thumbCtx;
  const isVertical = orientation === "vertical";
  const thumbSize = Math.max(ratio * 100, 10); // 최소 10% 크기
  const offset = valueNow * (100 - thumbSize);

  const isDragging = useRef(false);
  const startPos = useRef(0);
  const startScroll = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDragging.current = true;
      startPos.current = isVertical ? e.clientY : e.clientX;
      const viewport = scrollCtx.viewportRef.current;
      if (viewport) {
        startScroll.current = isVertical ? viewport.scrollTop : viewport.scrollLeft;
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isVertical, scrollCtx.viewportRef],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      const viewport = scrollCtx.viewportRef.current;
      if (!viewport) return;

      const currentPos = isVertical ? e.clientY : e.clientX;
      const delta = currentPos - startPos.current;

      // 트랙 크기 대비 스크롤 비율 계산
      const parentEl = (e.target as HTMLElement).parentElement;
      if (!parentEl) return;
      const trackSize = isVertical ? parentEl.clientHeight : parentEl.clientWidth;
      const scrollableSize = isVertical
        ? viewport.scrollHeight - viewport.clientHeight
        : viewport.scrollWidth - viewport.clientWidth;
      const scrollDelta = ((delta / trackSize) * scrollableSize) / (1 - ratio);

      if (isVertical) {
        viewport.scrollTop = startScroll.current + scrollDelta;
      } else {
        viewport.scrollLeft = startScroll.current + scrollDelta;
      }
    },
    [isVertical, scrollCtx.viewportRef, ratio],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (thumbCtx.thumbRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [thumbCtx.thumbRef, ref],
  );

  const thumbStyle: Record<string, string> = isVertical
    ? { height: `${thumbSize}%`, top: `${offset}%`, position: "absolute", width: "100%" }
    : { width: `${thumbSize}%`, left: `${offset}%`, position: "absolute", height: "100%" };

  const thumbProps: Record<string, unknown> = {
    "data-scope": "scroll-area",
    "data-part": "thumb",
    "data-orientation": orientation,
    style: thumbStyle,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  };

  return <div ref={mergedRef} {...mergeProps(thumbProps, props)} />;
});

const Corner = forwardRef<HTMLDivElement, ScrollAreaCornerProps>((props, ref) => {
  const cornerProps: Record<string, unknown> = {
    "data-scope": "scroll-area",
    "data-part": "corner",
  };

  return <div ref={ref} {...mergeProps(cornerProps, props)} />;
});

export const ScrollArea = {
  Root,
  Viewport,
  Scrollbar,
  Thumb,
  Corner,
};
