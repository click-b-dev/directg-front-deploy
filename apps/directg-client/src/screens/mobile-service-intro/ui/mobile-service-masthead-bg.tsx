"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

/**
 * legacy `#ja-masthead-bg` — 배경이미지 cover div.
 * legacy 스크립트: `$("#ja-masthead-bg").height(width*540/460)` (마운트 1회, resize 리스너 없음).
 * CSS엔 높이가 없어 JS로 460:540 비율 높이를 설정한다.
 */
export function MobileServiceMastheadBg({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // legacy: height = width * 540 / 460 (jQuery .width()=content width ≈ clientWidth)
    el.style.height = `${(el.clientWidth * 540) / 460}px`;
  }, []);

  return (
    <div id="ja-masthead-bg" ref={ref}>
      {children}
    </div>
  );
}
