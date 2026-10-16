import { apiClient } from "@shared/api/client";
import type { MemberAuthConfirmRequest, MemberAuthConfirmResponse } from "../model/types";

/**
 * 인증번호 확인. `POST /api/member/auth-confirm` — legacy join_proc `mode=authConfirm`.
 * 백엔드: `tbl_otp` token·otp 대조, 성공 시 `auth='1'` 갱신. 응답은 legacy JSON 형식 유지(실패 msg의 token 접미 quirk 포함).
 */
export async function postMemberAuthConfirm(
  payload: MemberAuthConfirmRequest,
): Promise<MemberAuthConfirmResponse> {
  return apiClient.post<MemberAuthConfirmResponse>("member/auth-confirm", payload);
}
