import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { GameCategoryResponse } from "../model/types";

/**
 * 카테고리별 상품 목록 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용).
 * `GET /api/game/category?category_code=X&page=N&{필터}` — legacy `Goods::getGoodsList2` + category_code
 * (filter_include category FULLTEXT), 60/page + `getTagName`(tagName). 필터/정렬은 백엔드. 파라미터명 verbatim.
 */
export async function getGameCategoryList(
  categoryCode: string,
  page: number,
  filters: ProductFilterParams = {},
): Promise<GameCategoryResponse> {
  const params = new URLSearchParams({ category_code: categoryCode, page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GameCategoryResponse>(`game/category?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
