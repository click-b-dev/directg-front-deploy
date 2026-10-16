import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MemberAccountInfo } from "../model/types";

/**
 * 계정 정보 조회 (server-only). 요청 쿠키를 전달해 세션 회원의 계정 정보를 조회.
 * `GET /api/mypage/account` — legacy `getMemberInfo(m_no)`.
 */
export async function getMemberAccount(): Promise<MemberAccountInfo> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MemberAccountInfo>("mypage/account", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
