import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { PublisherLandingResponse } from "../model/types";

/**
 * 퍼블리셔 랜딩 목록 조회 (server-only, 세션 쿠키 전달).
 * `GET /api/game/publisher-landing?publisher_code=X&page=N&sort=&{필터}` — legacy `getPublisherGoodsSearch`
 * (supplier_code + preorder/bonus 기간 + genre/platform/category MATCH). 검색/정렬/필터/60per-page는 백엔드.
 */
export async function getPublisherLanding(
  publisherCode: string,
  page: number,
  filters: ProductFilterParams = {},
  sort = "",
): Promise<PublisherLandingResponse> {
  const params = new URLSearchParams({ publisher_code: publisherCode, page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  if (sort) {
    params.set("sort", sort);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<PublisherLandingResponse>(`game/publisher-landing?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
