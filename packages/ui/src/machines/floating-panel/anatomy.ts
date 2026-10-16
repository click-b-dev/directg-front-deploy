/**
 * FloatingPanel 컴포넌트 해부학 (Zag.js 기준)
 */

export const floatingPanelAnatomy = {
  trigger: "trigger",
  positioner: "positioner",
  content: "content",
  header: "header",
  title: "title",
  body: "body",
  dragTrigger: "drag-trigger",
  resizeTrigger: "resize-trigger",
  closeTrigger: "close-trigger",
  minimizeTrigger: "minimize-trigger",
  maximizeTrigger: "maximize-trigger",
} as const;

export type FloatingPanelPart = keyof typeof floatingPanelAnatomy;
