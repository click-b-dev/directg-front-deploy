import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MemberSession } from "../model/types";

/**
 * SSR 세션 판독 (server-only). 요청 쿠키를 `GET /api/member/session`에 전달(httpOnly 세션 쿠키 기반).
 * 비로그인/오류 시 null. legacy `$_SESSION['member']` 대응.
 */
export async function getMemberSession(): Promise<MemberSession | null> {
  const cookieHeader = (await cookies()).toString();
  try {
    const { member } = await apiClient.get<{ member: MemberSession | null }>("member/session", {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });
    return member;
  } catch {
    return null;
  }
}
