/**
 * 포커스 관리 유틸
 * roving tabindex, focus trap 등 WAI-ARIA 포커스 패턴 구현
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
].join(",");

/** 포커스 가능한 요소 목록 반환 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"),
  );
}

/** 첫 번째 포커스 가능 요소에 포커스 */
export function focusFirst(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  elements[0]?.focus();
}

/** 마지막 포커스 가능 요소에 포커스 */
export function focusLast(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  elements[elements.length - 1]?.focus();
}

/**
 * Focus trap: Tab/Shift+Tab 시 컨테이너 내부에서만 순환
 * @returns cleanup 함수
 */
export function trapFocus(container: HTMLElement): () => void {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener("keydown", handleKeyDown);
  return () => container.removeEventListener("keydown", handleKeyDown);
}

/**
 * Roving tabindex: 현재 활성 아이템만 tabindex=0, 나머지는 -1
 */
export function setRovingTabindex(items: HTMLElement[], activeIndex: number): void {
  items.forEach((item, index) => {
    item.setAttribute("tabindex", index === activeIndex ? "0" : "-1");
  });
}
