import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { SeasonBannerListResponse } from "../model/section-types";

/**
 * 시즌 역대 최대할인 조회 (server-only, 세션 쿠키 — wishlist_chk). `GET /api/promotion/season/max-discount` —
 * legacy promotion_max_discount(sku[]) → getGoodsItemDetail → drawThumb + 전체보기 링크(promotion_max_discount_link).
 */
export async function getPromotionSeasonMaxDiscount(): Promise<SeasonBannerListResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<SeasonBannerListResponse>("promotion/season/max-discount", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
