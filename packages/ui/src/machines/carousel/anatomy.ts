/**
 * Carousel 컴포넌트 해부학 (Zag.js 기준)
 */

export const carouselAnatomy = {
  root: "root",
  viewport: "viewport",
  itemGroup: "item-group",
  item: "item",
  prevTrigger: "prev-trigger",
  nextTrigger: "next-trigger",
  indicatorGroup: "indicator-group",
  indicator: "indicator",
  autoplayTrigger: "autoplay-trigger",
} as const;

export type CarouselPart = keyof typeof carouselAnatomy;
