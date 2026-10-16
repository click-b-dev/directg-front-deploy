import { apiClient } from "@shared/api/client";
import type { MemberLoginRequest, MemberLoginResponse } from "../model/types";

/**
 * 이메일/비번 로그인. `POST /api/member/login` — 성공 시 백엔드가 httpOnly 세션 쿠키를 set한다.
 * legacy `pc/member/login_proc.php`. 응답 `{error_code, error_msg}`.
 */
export async function postMemberLogin(payload: MemberLoginRequest): Promise<MemberLoginResponse> {
  return apiClient.post<MemberLoginResponse>("member/login", payload);
}
