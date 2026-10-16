/**
 * Carousel 컴포넌트
 * WAI-ARIA Carousel 패턴 구현.
 * 슬라이드 탐색, 자동 재생, 키보드 네비게이션, 인디케이터를 지원한다.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { useMachine } from "@/hooks/use-machine";
import { useControllable } from "@/hooks/use-controllable";
import { useId } from "@/hooks/use-id";
import { createCarouselMachine, connectCarousel } from "@/machines/carousel";
import type { CarouselConnectReturn } from "@/machines/carousel";
import { mergeProps } from "@/machines/shared/dom";
import type {
  CarouselRootProps,
  CarouselViewportProps,
  CarouselItemGroupProps,
  CarouselItemProps,
  CarouselPrevTriggerProps,
  CarouselNextTriggerProps,
  CarouselIndicatorGroupProps,
  CarouselIndicatorProps,
  CarouselAutoplayTriggerProps,
} from "./carousel.types";

/** 내부 Context */
const CarouselContext = createContext<CarouselConnectReturn | null>(null);

const useCarouselContext = () => {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error("Carousel 하위 컴포넌트는 Carousel.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root */
const Root = ({
  index: indexProp,
  onIndexChange,
  defaultIndex = 0,
  totalSlides = 0,
  loop = false,
  autoPlay = false,
  autoPlayInterval = 4000,
  orientation = "horizontal",
  slidesPerView = 1,
  id: idProp,
  children,
}: CarouselRootProps) => {
  const id = useId(idProp);

  const [index, setIndex] = useControllable({
    value: indexProp,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });

  const machine = useMemo(
    () =>
      createCarouselMachine({
        id,
        index,
        totalSlides,
        loop,
        autoPlay,
        autoPlayInterval,
        orientation,
        slidesPerView,
      }),
    [id, index, totalSlides, loop, autoPlay, autoPlayInterval, orientation, slidesPerView],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectCarousel(state, context, send);

  // 머신 context.index → 외부 동기화
  useEffect(() => {
    if (context.index !== index) {
      setIndex(context.index);
    }
  }, [context.index, index, setIndex]);

  // 외부 index → 머신 동기화
  useEffect(() => {
    if (index !== context.index) {
      send({ type: "GO_TO", index });
    }
  }, [index, context.index, send]);

  // totalSlides 등 context 동기화
  useEffect(() => {
    send({
      type: "SET_CONTEXT",
      context: { totalSlides, loop, autoPlay, autoPlayInterval, orientation, slidesPerView },
    });
  }, [totalSlides, loop, autoPlay, autoPlayInterval, orientation, slidesPerView, send]);

  // 자동 재생 타이머
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "autoPlaying") {
      intervalRef.current = setInterval(() => {
        send({ type: "AUTO_PLAY_TICK" });
      }, context.autoPlayInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, context.autoPlayInterval, send]);

  const ctxValue = useMemo(() => api, [state, context, api]);

  return (
    <CarouselContext.Provider value={ctxValue}>
      <div {...api.rootProps}>{children}</div>
    </CarouselContext.Provider>
  );
};

/** Viewport */
const Viewport = forwardRef<HTMLDivElement, CarouselViewportProps>(({ children, ...rest }, ref) => {
  const api = useCarouselContext();
  const props = mergeProps(api.viewportProps, rest as Record<string, unknown>);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

/** ItemGroup */
const ItemGroup = forwardRef<HTMLDivElement, CarouselItemGroupProps>(
  ({ children, ...rest }, ref) => {
    const api = useCarouselContext();
    const props = mergeProps(api.itemGroupProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** Item */
const Item = forwardRef<HTMLDivElement, CarouselItemProps>(({ index, children, ...rest }, ref) => {
  const api = useCarouselContext();
  const itemProps = api.getItemProps({ index });
  const props = mergeProps(itemProps, rest as Record<string, unknown>);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

/** PrevTrigger */
const PrevTrigger = forwardRef<HTMLButtonElement, CarouselPrevTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useCarouselContext();
    const props = mergeProps(api.prevTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** NextTrigger */
const NextTrigger = forwardRef<HTMLButtonElement, CarouselNextTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useCarouselContext();
    const props = mergeProps(api.nextTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** IndicatorGroup */
const IndicatorGroup = forwardRef<HTMLDivElement, CarouselIndicatorGroupProps>(
  ({ children, ...rest }, ref) => {
    const api = useCarouselContext();
    const props = mergeProps(api.indicatorGroupProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

/** Indicator */
const Indicator = forwardRef<HTMLButtonElement, CarouselIndicatorProps>(
  ({ index, children, ...rest }, ref) => {
    const api = useCarouselContext();
    const indicatorProps = api.getIndicatorProps({ index });
    const props = mergeProps(indicatorProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

/** AutoplayTrigger */
const AutoplayTrigger = forwardRef<HTMLButtonElement, CarouselAutoplayTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useCarouselContext();
    const props = mergeProps(api.autoplayTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

export const Carousel = {
  Root,
  Viewport,
  ItemGroup,
  Item,
  PrevTrigger,
  NextTrigger,
  IndicatorGroup,
  Indicator,
  AutoplayTrigger,
};
