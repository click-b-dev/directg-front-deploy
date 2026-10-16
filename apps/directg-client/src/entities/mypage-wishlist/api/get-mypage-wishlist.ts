import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { WishlistResponse } from "../model/types";

/**
 * 위시리스트 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/wishlist?page=N` — legacy `Mypage2::getWishlist`
 * (a.m_no=세션회원, a.idx DESC, 20건/page). 프로모션가·title_sku는 백엔드 enrich.
 */
export async function getMypageWishlist(page: number): Promise<WishlistResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<WishlistResponse>(`mypage/wishlist?page=${page}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
