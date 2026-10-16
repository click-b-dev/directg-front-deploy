import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { SnsLoginConnectionsResponse } from "../model/types";

/**
 * 간편로그인 연결정보 조회 (server-only). `GET /api/mypage/sns-login` —
 * legacy `Member::getMemberSnsLogin(m_no)`.
 */
export async function getSnsLoginConnections(): Promise<SnsLoginConnectionsResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<SnsLoginConnectionsResponse>("mypage/sns-login", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
