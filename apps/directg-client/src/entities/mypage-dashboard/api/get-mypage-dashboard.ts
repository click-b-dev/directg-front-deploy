import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageDashboard } from "../model/types";

/**
 * 마이페이지 대시보드 (server-only). 요청 쿠키를 전달해 세션 회원의 집계/목록을 조회.
 * `GET /api/mypage/dashboard` — legacy mypage_main의 Order/Mypage2 조회.
 */
export async function getMypageDashboard(): Promise<MypageDashboard> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageDashboard>("mypage/dashboard", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
