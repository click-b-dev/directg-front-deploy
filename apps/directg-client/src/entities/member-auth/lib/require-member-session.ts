import { redirect } from "next/navigation";

import { getMemberSession } from "../api/get-member-session";
import type { MemberSession } from "../model/types";

/**
 * 로그인 가드 (server-only). legacy `pc/lib/login_check.php`.
 * 비로그인 시 `/member/login.html`로 redirect, 로그인 시 세션 반환.
 */
export async function requireMemberSession(): Promise<MemberSession> {
  const session = await getMemberSession();
  if (!session) {
    redirect("/member/login");
  }
  return session;
}
