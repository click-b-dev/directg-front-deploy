import { apiClient } from "@shared/api/client";
import type { WeekendRecommandResponse } from "../model/recommand-types";

/**
 * 주말특가 DG 추천게임 조회 (public). `GET /api/promotion/weekend/recommand` — legacy
 * promotion_week_recommand(sku[]) → getGoodsOptionTitleInfo/ItemDetail 파생. 파생·정규화는 백엔드.
 */
export async function getPromotionWeekendRecommand(): Promise<WeekendRecommandResponse> {
  return apiClient.get<WeekendRecommandResponse>("promotion/weekend/recommand");
}
