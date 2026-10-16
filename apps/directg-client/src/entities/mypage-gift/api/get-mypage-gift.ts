import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { GiftListResponse } from "../model/types";

/**
 * 사은품 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/gift` — legacy `Mypage::getGiftList`
 * (b.m_id=세션회원, b.idx DESC). UI는 페이지네이션 없이 목록만.
 */
export async function getMypageGift(page = 1): Promise<GiftListResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GiftListResponse>(`mypage/gift?page=${page}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
