import type { Metadata, Viewport } from "next";

import { getPromotionWeekendConfig } from "@entities/promotion-weekend/api/get-promotion-weekend-config";
import { getPromotionWeekendBest } from "@entities/promotion-weekend/api/get-promotion-weekend-best";
import { getPromotionWeekendGames } from "@entities/promotion-weekend/api/get-promotion-weekend-games";
import { getPromotionWeekendRecommand } from "@entities/promotion-weekend";
import { getPromotionEvents } from "@entities/event";
import { MobilePromotionWeekendScreen } from "@screens/mobile-promotion-weekend";

/** legacy mobile promotion_weekend.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile promotion_weekend.html head: title="주말특가 프로모션", canonical=PC URL(quirk), description/keywords 빈값. */
export const metadata: Metadata = {
  title: "주말특가 프로모션",
  description: "",
  keywords: "",
  alternates: { canonical: "https://directg.net/promotion/promotion_weekend" },
};

export default async function MobilePromotionWeekendPage() {
  // 공개(config는 세션 쿠키 전달). W-2~W-5 데이터 병렬 조회.
  const [config, recommand, best, events, games] = await Promise.all([
    getPromotionWeekendConfig(),
    getPromotionWeekendRecommand(),
    getPromotionWeekendBest(),
    getPromotionEvents(),
    getPromotionWeekendGames(),
  ]);
  // legacy 단일 순위 목록 재현: thumbList(top4) + gridList(나머지) 평면 concat.
  const bestList = [...best.thumbList, ...best.gridList];
  return (
    <MobilePromotionWeekendScreen
      config={config}
      recommand={recommand.list}
      best={bestList}
      events={events.list}
      games={games.list}
    />
  );
}
