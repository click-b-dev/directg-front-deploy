import { apiClient } from "@shared/api/client";
import type { MemberExistsResponse } from "../model/types";

/**
 * 회원 존재 확인. `GET /api/member/exists?m_id=` — legacy `Member::isMemberChk2`(status='0' 활성 회원).
 * 백엔드: `SELECT m_id FROM tbl_member WHERE m_id=:m_id AND status='0'` → 존재 여부.
 */
export async function getMemberExists(mId: string): Promise<MemberExistsResponse> {
  return apiClient.get<MemberExistsResponse>(`member/exists?m_id=${encodeURIComponent(mId)}`);
}
