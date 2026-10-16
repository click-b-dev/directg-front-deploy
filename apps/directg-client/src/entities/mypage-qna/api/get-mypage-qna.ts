import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { QnaListResponse } from "../model/types";

/**
 * 문의 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/qna?page=N` — legacy `Mypage::getqnaList`
 * (user_id=세션회원, reg_date DESC, 20건/page).
 */
export async function getMypageQna(page: number): Promise<QnaListResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<QnaListResponse>(`mypage/qna?page=${page}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
