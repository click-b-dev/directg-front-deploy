import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MemberAddress } from "../model/types";

/**
 * 배송지 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/address` — legacy `Mypage::getMemberAddress`.
 * 등록된 배송지가 없으면 빈 문자열 필드로 응답.
 */
export async function getMemberAddress(): Promise<MemberAddress> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MemberAddress>("mypage/address", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
