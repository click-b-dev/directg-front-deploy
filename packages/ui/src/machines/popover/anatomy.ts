/**
 * Popover 컴포넌트 해부학 (Zag.js 기준)
 */

export const popoverAnatomy = {
  trigger: "trigger",
  positioner: "positioner",
  content: "content",
  title: "title",
  description: "description",
  closeTrigger: "close-trigger",
  arrow: "arrow",
} as const;

export type PopoverPart = keyof typeof popoverAnatomy;
