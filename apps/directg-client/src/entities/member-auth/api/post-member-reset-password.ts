import { apiClient } from "@shared/api/client";
import type { MemberResetPasswordRequest, MemberResetPasswordResponse } from "../model/types";

/**
 * 비밀번호 재설정. `POST /api/member/reset-password` — legacy join_proc `mode=resetpassword`.
 * 백엔드: `tbl_member.m_pwd` 갱신. legacy는 OTP 인증 재검증 없음(가드는 페이지 진입 단에서만). 응답은 legacy JSON 형식 유지.
 */
export async function postMemberResetPassword(
  payload: MemberResetPasswordRequest,
): Promise<MemberResetPasswordResponse> {
  return apiClient.post<MemberResetPasswordResponse>("member/reset-password", payload);
}
