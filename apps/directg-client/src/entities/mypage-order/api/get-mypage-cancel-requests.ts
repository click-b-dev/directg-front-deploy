import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageCancelRequestResponse } from "../model/cancel-types";

/**
 * 취소요청 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/orders/cancel-requests` — legacy
 * `Mypage2::getOrderList_v2`(status 7·8 AND m_no=세션, order_item_id DESC, 20건/page).
 * search_date 기간 계산·shipment enrich는 백엔드. product_name LIKE 미적용(legacy 동일).
 */
export async function getMypageCancelRequests(
  page: number,
  searchProductName?: string,
  searchDate?: string,
): Promise<MypageCancelRequestResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchProductName) {
    params.set("search_product_name", searchProductName);
  }
  if (searchDate) {
    params.set("search_date", searchDate);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageCancelRequestResponse>(
    `mypage/orders/cancel-requests?${params.toString()}`,
    { headers: cookieHeader ? { cookie: cookieHeader } : undefined },
  );
}
