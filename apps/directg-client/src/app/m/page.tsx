import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { getMainBanners } from "@entities/main-banner";
import { getNotices } from "@entities/notice";
import { getMainRecommendations } from "@entities/main-recommand";
import { getBestTitles } from "@entities/best-title";
import { getNewGames } from "@entities/new-game";
import { getPreorderGames } from "@entities/preorder-game";
import { MobileHomeScreen } from "@screens/mobile-home";

/** legacy mobile index.php: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #ffffff. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

/** legacy mobile index.php head: title/description/keywords/canonical/favicon/manifest + mobile-web-app 메타. */
export const metadata: Metadata = {
  title: "다이렉트 게임즈",
  description:
    "다이렉트 게임즈는 세계 유수의 개발사 및 퍼블리셔와 직접 제휴하여 자체 유통 마진은 최소화하면서도 양질의 상품들을 좀 더 합리적인 가치로써 제공하고 있습니다.",
  keywords: "다이렉트 게임즈,다렉,H2,에이치투,H2interactive,에이치투인터렉티브",
  alternates: { canonical: "https://directg.net" },
  icons: { shortcut: "/favicon/favicon-32x32.png" },
  manifest: "/manifest.json?t=20260126_2",
  // legacy: <meta name="mobile-web-app-capable" content="yes"> + apple-mobile-web-app-status-bar-style
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default async function MobileHomePage() {
  // legacy index.php: getMainBanner()/getNoticeMain(3)/getMainRecommand()/getBestTitle(10)/getNewGame(8)/getGoodsPreorder(12) 매 요청 SSR
  const [banners, notices, recommands, bestTitles, newGames, preorderGames] = await Promise.all([
    getMainBanners(),
    getNotices(3),
    getMainRecommendations(),
    getBestTitles(10),
    getNewGames(8),
    getPreorderGames(12),
  ]);

  return (
    <>
      {/* legacy mobile index.php head 추가 자산 (layout이 담당하지 않는 홈 전용) */}
      <link
        rel="stylesheet preload"
        as="style"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      {/* legacy index.php 인라인 style */}
      <style>{`#appCapsule{padding-bottom:56px;}.adbox.fixed{width:320px;}.adbox-320-55 img{width:320px;height:55px;}`}</style>

      {/* Splide JS (window.Splide) — CSS는 mobile style.css가 @import. legacy: /assets/js/plugins/splide/splide.min.js */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"
        strategy="afterInteractive"
      />

      <MobileHomeScreen
        banners={banners}
        notices={notices}
        recommands={recommands}
        bestTitles={bestTitles}
        newGames={newGames}
        preorderGames={preorderGames}
      />
    </>
  );
}
