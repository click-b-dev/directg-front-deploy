import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { WeekendBestResponse } from "../model/best-types";

/**
 * 주말특가 인기게임 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용). `GET /api/promotion/weekend/best` —
 * legacy promotion_week_best(sku[]) → getGoodsOptionTitleInfo/ItemDetail 파생 → ProductThumb.
 * top4=thumbList(drawThumb), 나머지=gridList(drawGrid). 파생·정규화는 백엔드.
 */
export async function getPromotionWeekendBest(): Promise<WeekendBestResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<WeekendBestResponse>("promotion/weekend/best", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
