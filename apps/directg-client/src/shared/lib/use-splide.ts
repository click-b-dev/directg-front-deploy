"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Splide(@4.1.4, CDN 전역) 캐러셀을 대상 엘리먼트에 마운트한다.
 * CDN 스크립트 로드가 hydration보다 늦을 수 있어 `window.Splide` 준비까지 폴링한다.
 * options는 마운트 시점 값으로 고정한다(legacy는 DOMContentLoaded 1회 초기화).
 */
export function useSplide<T extends HTMLElement>(
  options: Record<string, unknown>,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    let instance: SplideInstance | undefined;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      const el = ref.current;
      if (!el) return;
      if (!window.Splide) {
        window.setTimeout(init, 50);
        return;
      }
      instance = new window.Splide(el, options);
      instance.mount();
    };

    init();

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, []);

  return ref;
}
