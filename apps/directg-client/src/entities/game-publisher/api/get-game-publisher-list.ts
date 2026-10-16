import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { GamePublisherResponse } from "../model/types";

/**
 * 퍼블리셔별 상품 목록 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용).
 * `GET /api/game/publisher?publisher_code=X&page=N&{필터}` — legacy `Goods::getGoodsList2` +
 * `supplier_code=publisher_code`(filter_include), 60/page + `getPublisher`(publisherName). 필터/정렬은 백엔드.
 */
export async function getGamePublisherList(
  publisherCode: string,
  page: number,
  filters: ProductFilterParams = {},
): Promise<GamePublisherResponse> {
  const params = new URLSearchParams({ publisher_code: publisherCode, page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GamePublisherResponse>(`game/publisher?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
