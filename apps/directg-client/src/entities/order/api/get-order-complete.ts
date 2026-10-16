import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { OrderComplete } from "../model/types";

/**
 * 주문완료 데이터 조회 (server-only, 세션 쿠키 전달). `GET /api/order/complete?settle_no=` —
 * legacy getOrder + getOrderItem + getGoodsItemDetail enrich, kcp면 getKcpLog(가상계좌). 회원 소유 검증은 백엔드.
 */
export async function getOrderComplete(settleNo: string): Promise<OrderComplete> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<OrderComplete>(`order/complete?settle_no=${encodeURIComponent(settleNo)}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
