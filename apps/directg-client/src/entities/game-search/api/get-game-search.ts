import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { GameSearchResponse } from "../model/types";

/**
 * 통합검색 조회 (server-only, 세션 쿠키 전달 — wishlist_chk 등).
 * `GET /api/game/search?page=N&{q·필터·sort}` — legacy `getGoodsSearch`/`getGoodsPromotionSearch`(is_promotion 분기),
 * MATCH BOOLEAN + sort 컬럼분기. 검색/정렬/필터/60per-page는 백엔드. 파라미터명 verbatim.
 */
export async function getGameSearch(
  page: number,
  filters: ProductFilterParams = {},
  sort = "",
): Promise<GameSearchResponse> {
  const params = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  if (sort) {
    params.set("sort", sort);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GameSearchResponse>(`game/search?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
