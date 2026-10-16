import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { OrderCheckout } from "../model/types";

/**
 * 주문서 데이터 조회 (server-only, 세션 쿠키 전달). `GET /api/order/checkout` —
 * legacy `getOrderItemList(세션 m_no, selected)` + `getMemberEmoney`(dgkr) + `getMemberAddress`.
 * 항목 0건이면 라우트에서 cart.html redirect.
 */
export async function getOrderCheckout(): Promise<OrderCheckout> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<OrderCheckout>("order/checkout", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
