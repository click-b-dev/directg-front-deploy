import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { GoodsItemDetailResponse } from "../model/types";

/**
 * 액세서리/실물 상품 상세 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용).
 * `GET /api/game/goods-item-detail?product_id={title_sku}&sku={goods_sku}` — legacy `pc/game/goods_item_view.html`.
 */
export async function getGoodsItemDetail(
  productId: string,
  sku: string,
): Promise<GoodsItemDetailResponse> {
  const params = new URLSearchParams({ product_id: productId, sku });
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GoodsItemDetailResponse>(`game/goods-item-detail?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
