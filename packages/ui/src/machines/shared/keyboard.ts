/**
 * 키보드 상수 및 유틸
 * WAI-ARIA 키보드 인터랙션 구현에 사용
 */

export const Keys = {
  Enter: "Enter",
  Space: " ",
  Escape: "Escape",
  Tab: "Tab",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Backspace: "Backspace",
  Delete: "Delete",
} as const;

export type Key = (typeof Keys)[keyof typeof Keys];

/** 특정 키인지 확인 */
export function isKey(key: string, ...targets: Key[]): boolean {
  return targets.includes(key as Key);
}

/** printable 문자인지 확인 (typeahead 등에서 사용) */
export function isPrintableKey(key: string): boolean {
  return key.length === 1 && !isKey(key, Keys.Space);
}

/** 방향키 그룹 */
export function isArrowKey(key: string): boolean {
  return isKey(key, Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight);
}

/**
 * 방향에 따른 다음/이전 인덱스 계산
 * orientation에 따라 ArrowUp/Left = prev, ArrowDown/Right = next
 */
export function getNextIndex(
  key: string,
  currentIndex: number,
  itemCount: number,
  options: {
    orientation?: "horizontal" | "vertical";
    loop?: boolean;
  } = {},
): number {
  const { orientation = "vertical", loop = true } = options;

  const prevKeys =
    orientation === "vertical" ? [Keys.ArrowUp, Keys.ArrowLeft] : [Keys.ArrowLeft, Keys.ArrowUp];
  const nextKeys =
    orientation === "vertical"
      ? [Keys.ArrowDown, Keys.ArrowRight]
      : [Keys.ArrowRight, Keys.ArrowDown];

  if (isKey(key, ...prevKeys)) {
    if (currentIndex <= 0) return loop ? itemCount - 1 : 0;
    return currentIndex - 1;
  }

  if (isKey(key, ...nextKeys)) {
    if (currentIndex >= itemCount - 1) return loop ? 0 : itemCount - 1;
    return currentIndex + 1;
  }

  if (isKey(key, Keys.Home)) return 0;
  if (isKey(key, Keys.End)) return itemCount - 1;

  return currentIndex;
}
