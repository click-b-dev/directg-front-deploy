import type { Metadata, Viewport } from "next";

import { getPromotionSeasonConfig } from "@entities/promotion-season/api/get-promotion-season-config";
import { getPromotionSeasonRecommand } from "@entities/promotion-season/api/get-promotion-season-recommand";
import { getPromotionSeasonBest } from "@entities/promotion-season/api/get-promotion-season-best";
import { getPromotionSeasonMaxDiscount } from "@entities/promotion-season/api/get-promotion-season-max-discount";
import { getPromotionSeasonAddRepay } from "@entities/promotion-season/api/get-promotion-season-add-repay";
import { getPromotionSeasonPrices } from "@entities/promotion-season/api/get-promotion-season-prices";
import { getPromotionSeasonGames } from "@entities/promotion-season/api/get-promotion-season-games";
import { getPromotionEvents } from "@entities/event";
import { MobilePromotionSeasonScreen } from "@screens/mobile-promotion-season";

/** legacy mobile promotion_season.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile promotion_season.html head: title=promotion_season_name(동적), canonical=PC URL(quirk), description/keywords 빈값(author/alternate 없음). */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getPromotionSeasonConfig();
  return {
    title: config.name,
    description: "",
    keywords: "",
    alternates: { canonical: "https://directg.net/promotion/promotion_season" },
  };
}

export default async function MobilePromotionSeasonPage() {
  // 공개(config/best/max-discount/add-repay/prices/games는 세션 쿠키 전달). 시즌 랜딩 전 섹션 병렬 조회.
  const [config, recommand, best, events, maxDiscount, addRepay, prices, games] = await Promise.all(
    [
      getPromotionSeasonConfig(),
      getPromotionSeasonRecommand(),
      getPromotionSeasonBest(),
      getPromotionEvents(),
      getPromotionSeasonMaxDiscount(),
      getPromotionSeasonAddRepay(),
      getPromotionSeasonPrices(),
      getPromotionSeasonGames(),
    ],
  );
  // legacy 단일 순위 목록 재현: thumbList(top4) + gridList(나머지) 평면 concat.
  const bestList = [...best.thumbList, ...best.gridList];
  return (
    <MobilePromotionSeasonScreen
      config={config}
      recommand={recommand.list}
      best={bestList}
      events={events.list}
      maxDiscount={maxDiscount}
      addRepay={addRepay}
      prices={prices}
      games={games.list}
    />
  );
}
