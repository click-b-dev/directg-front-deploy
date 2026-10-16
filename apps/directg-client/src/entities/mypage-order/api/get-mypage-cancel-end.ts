import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageCancelEndResponse } from "../model/cancel-end-types";

/**
 * 취소완료 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/orders/cancel-end` — legacy
 * `Mypage2::getOrderList_v2`(status 9 AND m_no=세션, order_item_id DESC, 20건/page). shipment enrich는 백엔드.
 * legacy는 날짜/상품명 필터 미적용(dead) — 페이지네이션 param 유지용으로만 전달.
 */
export async function getMypageCancelEnd(
  page: number,
  searchProductName?: string,
  searchDate?: string,
): Promise<MypageCancelEndResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchProductName) {
    params.set("search_product_name", searchProductName);
  }
  if (searchDate) {
    params.set("search_date", searchDate);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageCancelEndResponse>(`mypage/orders/cancel-end?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
