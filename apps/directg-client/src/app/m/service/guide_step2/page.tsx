import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { MobileServiceGuideStep2Screen } from "@screens/mobile-service-guide-step2";

/** legacy mobile guide_step2.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile guide_step2.html head: title="구매방법", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "구매방법",
  description: "",
  keywords: "",
};

/**
 * legacy 페이지 `<style>`(pagination) + 하단바 숨김.
 * legacy step 페이지는 bottom_menu 미포함이나 `/m/layout.tsx`가 전역 렌더 → `.appBottomMenu`를 숨겨
 * legacy(하단바 없음 + carousel-button-footer) 시각 parity 유지(공유 레이아웃 무수정).
 */
const STEP_STYLE = `.carousel-slider .splide__pagination{bottom:5rem;}.carousel-slider .splide__pagination button.is-active{background:#ffffff !important;}.appBottomMenu{display:none !important;}`;

export default function MobileServiceGuideStep2Page() {
  return (
    <>
      <style>{STEP_STYLE}</style>

      {/* Splide JS (window.Splide) — 구매방법 캐러셀 마운트. CSS는 mobile style.css @import. */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"
        strategy="afterInteractive"
      />

      <MobileServiceGuideStep2Screen />
    </>
  );
}
