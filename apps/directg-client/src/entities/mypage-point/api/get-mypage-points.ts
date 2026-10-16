import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypagePointList } from "../model/types";

/**
 * 포인트 내역 조회 (server-only). 요청 쿠키 전달, page 페이지네이션.
 * `GET /api/mypage/points?page=N` — legacy `getPointList`.
 */
export async function getMypagePoints(page: number): Promise<MypagePointList> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypagePointList>(`mypage/points?page=${page}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
