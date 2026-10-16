/**
 * Menu 컴포넌트 해부학 (Zag.js 기준)
 */

export const menuAnatomy = {
  trigger: "trigger",
  positioner: "positioner",
  content: "content",
  item: "item",
  itemGroupLabel: "item-group-label",
  separator: "separator",
  itemGroup: "item-group",
} as const;

export type MenuPart = keyof typeof menuAnatomy;
