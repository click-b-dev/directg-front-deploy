/**
 * Carousel 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode } from "react";

export interface CarouselRootProps {
  /** 제어 모드: 현재 슬라이드 인덱스 */
  index?: number;
  /** 제어 모드: 인덱스 변경 콜백 */
  onIndexChange?: (index: number) => void;
  /** 비제어 모드: 초기 인덱스 */
  defaultIndex?: number;
  /** 전체 슬라이드 수 */
  totalSlides?: number;
  /** 순환 여부 */
  loop?: boolean;
  /** 자동 재생 */
  autoPlay?: boolean;
  /** 자동 재생 간격 (ms) */
  autoPlayInterval?: number;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 한 번에 보이는 슬라이드 수 */
  slidesPerView?: number;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface CarouselViewportProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface CarouselItemGroupProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface CarouselItemProps extends ComponentPropsWithRef<"div"> {
  /** 슬라이드 인덱스 */
  index: number;
  children: ReactNode;
}

export interface CarouselPrevTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface CarouselNextTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface CarouselIndicatorGroupProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
}

export interface CarouselIndicatorProps extends ComponentPropsWithRef<"button"> {
  /** 인디케이터가 가리키는 슬라이드 인덱스 */
  index: number;
  children?: ReactNode;
}

export interface CarouselAutoplayTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}
