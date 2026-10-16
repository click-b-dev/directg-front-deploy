/**
 * SignaturePad 컴포넌트 해부학 (Zag.js 기준)
 */

export const signaturePadAnatomy = {
  root: "root",
  control: "control",
  segment: "segment",
  guide: "guide",
  clearTrigger: "clear-trigger",
  label: "label",
} as const;

export type SignaturePadPart = keyof typeof signaturePadAnatomy;
