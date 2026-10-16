import type { Metadata, Viewport } from "next";
import Script from "next/script";

import {
  MobileServiceGuideSteamStepScreen,
  STEAM_STEPS,
} from "@screens/mobile-service-guide-steam-step";

/** legacy mobile guide_steam_step2.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = STEAM_STEPS["2"].meta;

/** step2만 pagination `<style>` 보유(legacy). + bottom_menu 미포함 → 하단바 숨김. */
const STEP_STYLE = `.carousel-slider .splide__pagination{bottom:5rem;}.carousel-slider .splide__pagination button.is-active{background:#ffffff !important;}.appBottomMenu{display:none !important;}`;

export default function MobileServiceGuideSteamStep2Page() {
  return (
    <>
      <style>{STEP_STYLE}</style>
      <Script
        src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"
        strategy="afterInteractive"
      />
      <MobileServiceGuideSteamStepScreen step={STEAM_STEPS["2"]} />
    </>
  );
}
