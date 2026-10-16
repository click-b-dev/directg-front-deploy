/**
 * 계정 설정 데이터/계약 (legacy `pc/mypage/account_settings.html` — getMemberInfo/account_proc).
 * 문서: docs/migration/storefront/mypage/account-settings.md
 */

/** 회원 계정 정보 (getMemberInfo). */
export interface MemberAccountInfo {
  m_id: string;
  name: string;
  hp: string;
  birth_day: string;
  /** "Y"=본인인증 완료, 그외=미인증. */
  is_auth: string;
  /** "Y"=메일수신 동의. */
  mailling: string;
  email: string;
}

/** account_proc 뮤테이션 공통 응답. */
export interface AccountMutationResponse {
  error_msg: string;
}

/** KCP 본인인증 거래등록 응답 (cert_reg). res_cd "0000"=성공. */
export interface CertRegResponse {
  res_cd: string;
  res_msg: string;
  call_url: string;
  reg_cert_key: string;
}
