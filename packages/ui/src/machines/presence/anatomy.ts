/**
 * Presence 컴포넌트 해부학
 */

export const presenceAnatomy = {
  root: "presence",
} as const;

export type PresencePart = keyof typeof presenceAnatomy;
