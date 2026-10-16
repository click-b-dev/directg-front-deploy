import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { GameGenreResponse } from "../model/types";

/**
 * 장르별 상품 목록 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용).
 * `GET /api/game/genre?genre_code=X&page=N&{필터}` — legacy `Goods::getGoodsList2` + genre_code
 * (filter_include genre FULLTEXT), 60/page + `getPrimaryGenreName`(genreName) + `getGenreBestTitle`(bestTitles).
 * legacy는 검색(q) 미전달. 필터/정렬은 백엔드. 파라미터명 verbatim.
 */
export async function getGameGenreList(
  genreCode: string,
  page: number,
  filters: ProductFilterParams = {},
): Promise<GameGenreResponse> {
  const params = new URLSearchParams({ genre_code: genreCode, page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GameGenreResponse>(`game/genre?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
