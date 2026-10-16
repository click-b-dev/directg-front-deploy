import { apiClient } from "@shared/api/client";
import type { MemberPasswordResetRequest, MemberPasswordResetResponse } from "../model/types";

/**
 * 비밀번호 재설정(모바일). `POST /api/member/password/reset` — legacy 모바일 `find_password_reset_proc.php`(memberPwdReset).
 * 백엔드: `tbl_member.m_pwd` 갱신. legacy는 OTP/token 재검증 없음(가드는 진입 단만). 응답 `{code, message}`(code "ok"=성공).
 * PC의 `postMemberResetPassword`(error_code/msg, m_pwd)와 별도 계약(모바일 흐름).
 */
export async function postMemberPasswordReset(
  payload: MemberPasswordResetRequest,
): Promise<MemberPasswordResetResponse> {
  return apiClient.post<MemberPasswordResetResponse>("member/password/reset", payload);
}
