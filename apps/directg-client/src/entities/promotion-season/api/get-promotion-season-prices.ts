import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { SeasonPricesResponse } from "../model/section-types";

/**
 * 시즌 가격대 게임 조회 (server-only, 세션 쿠키 — wishlist_chk). `GET /api/promotion/season/prices` —
 * legacy promotion_price_5000/10000(sku[]) → getGoodsItemDetail → drawSmallList. 5천/1만원 미만.
 */
export async function getPromotionSeasonPrices(): Promise<SeasonPricesResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<SeasonPricesResponse>("promotion/season/prices", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
