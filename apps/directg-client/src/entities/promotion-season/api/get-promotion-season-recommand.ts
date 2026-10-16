import { apiClient } from "@shared/api/client";
import type { WeekendRecommandResponse } from "@entities/promotion-weekend";

/**
 * 시즌 DG 추천게임 조회 (public). `GET /api/promotion/season/recommand` — legacy promotion_season_recommand
 * → getGoodsOptionTitleInfo/ItemDetail 파생. weekend 추천과 동일 형태(WeekendRecommandGame 재사용).
 */
export async function getPromotionSeasonRecommand(): Promise<WeekendRecommandResponse> {
  return apiClient.get<WeekendRecommandResponse>("promotion/season/recommand");
}
