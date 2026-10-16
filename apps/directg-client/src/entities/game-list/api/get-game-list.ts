import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { GameListResponse } from "../model/types";

/**
 * 전체 게임 목록 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용).
 * `GET /api/game/list?page=N&{필터}` — legacy `Goods::getGoodsList2`(filter_include, category_code/q 없음), 60/page.
 * 필터/정렬은 백엔드. 파라미터명 verbatim.
 */
export async function getGameList(
  page: number,
  filters: ProductFilterParams = {},
): Promise<GameListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GameListResponse>(`game/list?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
