/**
 * Tooltip 컴포넌트 해부학 (Zag.js 기준)
 */

export const tooltipAnatomy = {
  trigger: "trigger",
  positioner: "positioner",
  content: "content",
  arrow: "arrow",
} as const;

export type TooltipPart = keyof typeof tooltipAnatomy;
