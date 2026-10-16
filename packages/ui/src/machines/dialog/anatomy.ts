/**
 * Dialog 컴포넌트 해부학 (Zag.js 기준)
 */

export const dialogAnatomy = {
  trigger: "trigger",
  backdrop: "backdrop",
  positioner: "positioner",
  content: "content",
  title: "title",
  description: "description",
  closeTrigger: "close-trigger",
} as const;

export type DialogPart = keyof typeof dialogAnatomy;
