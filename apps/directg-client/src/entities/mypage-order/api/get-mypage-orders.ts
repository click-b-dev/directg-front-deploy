import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageOrderListResponse } from "../model/types";

/**
 * 주문완료 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/orders` — legacy `Mypage2::getOrderList_v2`
 * (a.step/b.status 3분기, b.m_no=세션, order_item_id DESC, 20건/page). search_date 기간 계산·enrich는 백엔드.
 */
export async function getMypageOrders(
  page: number,
  searchProductName?: string,
  searchDate?: string,
): Promise<MypageOrderListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchProductName) {
    params.set("search_product_name", searchProductName);
  }
  if (searchDate) {
    params.set("search_date", searchDate);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageOrderListResponse>(`mypage/orders?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
