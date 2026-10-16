import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { BundleDetailResponse } from "../model/types";

/**
 * 번들 상세 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용).
 * `GET /api/game/bundle-detail?sku={goods_sku}` — legacy `pc/game/bundle_view.html`.
 */
export async function getBundleDetail(sku: string): Promise<BundleDetailResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<BundleDetailResponse>(`game/bundle-detail?sku=${encodeURIComponent(sku)}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
