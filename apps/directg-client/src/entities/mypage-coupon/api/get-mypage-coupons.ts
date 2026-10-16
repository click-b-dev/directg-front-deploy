import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageCouponList } from "../model/types";

/**
 * 쿠폰 내역 조회 (server-only). 요청 쿠키 전달, page 페이지네이션.
 * `GET /api/mypage/coupons?page=N` — legacy `getCouponList`.
 */
export async function getMypageCoupons(page: number): Promise<MypageCouponList> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageCouponList>(`mypage/coupons?page=${page}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
