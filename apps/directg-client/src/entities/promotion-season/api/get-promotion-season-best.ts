import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { WeekendBestResponse } from "@entities/promotion-weekend";

/**
 * 시즌 프로모션 인기게임 조회 (server-only, 세션 쿠키 — wishlist_chk). `GET /api/promotion/season/best` —
 * legacy promotion_season_best. top4=thumbList, 나머지=gridList. 파생·정규화는 백엔드(WeekendBestResponse 재사용).
 */
export async function getPromotionSeasonBest(): Promise<WeekendBestResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<WeekendBestResponse>("promotion/season/best", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
