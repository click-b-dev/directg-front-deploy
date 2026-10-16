/**
 * Collapsible 컴포넌트 해부학 (Zag.js 기준)
 */

export const collapsibleAnatomy = {
  root: "collapsible",
  trigger: "trigger",
  content: "content",
} as const;

export type CollapsiblePart = keyof typeof collapsibleAnatomy;
