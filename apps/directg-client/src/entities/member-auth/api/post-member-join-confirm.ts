import { apiClient } from "@shared/api/client";
import type { MemberJoinConfirmRequest, MemberJoinConfirmResponse } from "../model/types";

/**
 * 이메일 인증 랜딩 검증·승인. `POST /api/member/join-confirm` — legacy `pc/member/join_confirm.php`.
 * 백엔드: chkMemberAuth + md5(m_id+m_no)==auth_key 검증 + approvalMember. 응답 `{error_code, msg}`.
 */
export async function postMemberJoinConfirm(
  payload: MemberJoinConfirmRequest,
): Promise<MemberJoinConfirmResponse> {
  return apiClient.post<MemberJoinConfirmResponse>("member/join-confirm", payload);
}
