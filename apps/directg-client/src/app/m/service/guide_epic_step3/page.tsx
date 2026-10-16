import type { Metadata, Viewport } from "next";
import Script from "next/script";

import {
  MobileServiceGuideEpicStepScreen,
  EPIC_STEPS,
} from "@screens/mobile-service-guide-epic-step";

/** legacy mobile guide_epic_step3.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** step3 head는 Mobilekit 템플릿 잔재(description/keywords) verbatim. */
export const metadata: Metadata = EPIC_STEPS["3"].meta;

/** legacy step은 bottom_menu 미포함 → `/m/layout` 전역 하단바를 숨겨 시각 parity 유지(공유 레이아웃 무수정). */
const STEP_STYLE = `.appBottomMenu{display:none !important;}`;

export default function MobileServiceGuideEpicStep3Page() {
  return (
    <>
      <style>{STEP_STYLE}</style>
      <Script
        src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"
        strategy="afterInteractive"
      />
      <MobileServiceGuideEpicStepScreen step={EPIC_STEPS["3"]} />
    </>
  );
}
