import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { SeasonBannerListResponse } from "../model/section-types";

/**
 * 시즌 추가 포인트 적립 조회 (server-only, 세션 쿠키 — wishlist_chk). `GET /api/promotion/season/add-repay` —
 * legacy promotion_add_repay(sku[]) → getGoodsItemDetail → drawThumb + 전체보기 링크(promotion_add_repay_link).
 */
export async function getPromotionSeasonAddRepay(): Promise<SeasonBannerListResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<SeasonBannerListResponse>("promotion/season/add-repay", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
