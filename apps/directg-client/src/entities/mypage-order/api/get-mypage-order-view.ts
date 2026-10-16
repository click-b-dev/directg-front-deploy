import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageOrderViewResponse } from "../model/order-view-types";

/**
 * 주문 내역 상세 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/orders/view?settle_no=X` —
 * legacy `Mypage::getOrderV2`/`getOrderItemV2`(m_no 소유확인) + PG bill URL + 택배 배송상태.
 */
export async function getMypageOrderView(settleNo: string): Promise<MypageOrderViewResponse> {
  const cookieHeader = (await cookies()).toString();
  const params = new URLSearchParams({ settle_no: settleNo });
  return apiClient.get<MypageOrderViewResponse>(`mypage/orders/view?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
