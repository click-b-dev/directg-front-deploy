import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams, PromotionIngResponse } from "../model/types";

/**
 * 할인진행중 목록 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용). `GET /api/promotion/ing?page=N&{필터}` —
 * legacy `Goods::getGoodsList2` + `is_promotion='Y'` 고정, 60건/page. 필터/정렬 파라미터(filter_include.php)는
 * 백엔드가 SQL로 처리. 파라미터명은 legacy verbatim.
 */
export async function getPromotionIngList(
  page: number,
  filters: ProductFilterParams = {},
): Promise<PromotionIngResponse> {
  const params = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<PromotionIngResponse>(`promotion/ing?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
