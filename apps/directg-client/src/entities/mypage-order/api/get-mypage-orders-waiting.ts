import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageOrderWaitingResponse } from "../model/waiting-types";

/**
 * 입금대기 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/orders/waiting` — legacy
 * `Mypage2::getOrderList_vbank`(step=1 AND status=3, kcp_log/payco_log 조인, order_item_id DESC, 20건/page).
 * settle_no 그룹핑·provider 해석·va_date 정규화·deposit_status 판정은 백엔드.
 */
export async function getMypageOrdersWaiting(
  page: number,
  searchProductName?: string,
  searchDate?: string,
): Promise<MypageOrderWaitingResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchProductName) {
    params.set("search_product_name", searchProductName);
  }
  if (searchDate) {
    params.set("search_date", searchDate);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageOrderWaitingResponse>(`mypage/orders/waiting?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
