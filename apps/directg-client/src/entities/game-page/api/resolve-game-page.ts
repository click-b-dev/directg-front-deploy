import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { GamePageResolve } from "../model/types";

/**
 * product_code → 상세 리다이렉트 정보 리졸브 (server-only).
 * `GET /api/game/page-resolve?product_code=X` — legacy `getGoodsItemDetail` + `getGoodsOptionTitleInfo` 조합.
 * game_page.html의 301 리다이렉트 대상(game_type/goods_sku/title_sku)을 반환한다.
 */
export async function getGamePageResolve(productCode: string): Promise<GamePageResolve> {
  const params = new URLSearchParams({ product_code: productCode });
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GamePageResolve>(`game/page-resolve?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
