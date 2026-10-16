import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { CartListResponse } from "../model/types";

/**
 * 장바구니 조회 (server-only, 세션 쿠키 전달). `GET /api/order/cart` — legacy `Order::getCartList(세션 m_no)`.
 * 프로모션가·title_sku는 백엔드 enrich. 비로그인 시 라우트에서 `requireMemberSession()`이 먼저 차단.
 */
export async function getCart(): Promise<CartListResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<CartListResponse>("order/cart", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
