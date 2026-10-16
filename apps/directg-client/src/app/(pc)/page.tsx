import type { Metadata, Viewport } from "next";

import { getMainBanners } from "@entities/main-banner";
import { getNotices } from "@entities/notice";
import { getMainRecommendations } from "@entities/main-recommand";
import { getBestTitles } from "@entities/best-title";
import { getNewGames } from "@entities/new-game";
import { getPreorderGames } from "@entities/preorder-game";
import { getSpokenKoreanGames, getExclusiveKoreanGames } from "@entities/korean-game";
import { HomeScreen } from "@screens/home";

/** legacy pc/index.php head SEO 메타. OG 태그는 legacy에 없음. */
export const metadata: Metadata = {
  title: "다이렉트 게임즈",
  description:
    "다이렉트 게임즈는 세계 유수의 개발사 및 퍼블리셔와 직접 제휴하여 자체 유통 마진은 최소화하면서도 양질의 상품들을 좀 더 합리적인 가치로써 제공하고 있습니다.",
  keywords: "다이렉트 게임즈,다렉,H2,에이치투,H2interactive,에이치투인터렉티브",
  authors: [{ name: "H2interactive" }],
  alternates: {
    canonical: "https://directg.net",
    media: { "only screen and (max-width: 640px)": "https://m.directg.net" },
  },
  icons: { shortcut: "/favicon.ico?t=20250828" },
};

/** legacy는 viewport에 initial-scale이 없음(width=device-width만). */
export const viewport: Viewport = { width: "device-width" };

export default async function HomePage() {
  const [
    banners,
    notices,
    recommendations,
    bestTitles,
    newGames,
    preorderGames,
    spokenKoreanGames,
    exclusiveKoreanGames,
  ] = await Promise.all([
    getMainBanners(),
    getNotices(5),
    getMainRecommendations(),
    getBestTitles(12),
    getNewGames(8),
    getPreorderGames(30),
    getSpokenKoreanGames(5),
    getExclusiveKoreanGames(5),
  ]);

  return (
    <HomeScreen
      banners={banners}
      notices={notices}
      recommendations={recommendations}
      bestTitles={bestTitles}
      newGames={newGames}
      preorderGames={preorderGames}
      spokenKoreanGames={spokenKoreanGames}
      exclusiveKoreanGames={exclusiveKoreanGames}
    />
  );
}
