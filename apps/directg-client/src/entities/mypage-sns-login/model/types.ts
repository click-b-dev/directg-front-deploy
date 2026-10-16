/**
 * 마이페이지 — 간편로그인 연결 (legacy `pc/mypage/sns_login_connect.html`).
 * 문서: docs/migration/storefront/mypage/sns-login-connect.md
 */

export type SnsConnectType = "PAYCO" | "KAKAO" | "NAVER";

/** legacy `Member::getMemberSnsLogin` 행. 연결된 provider만 내려온다. */
export interface SnsLoginConnection {
  sns_type: string;
  sns_connect_date: string;
  sns_id?: string;
  sns_name?: string;
  email: string;
}

export interface SnsLoginConnectionsResponse {
  list: SnsLoginConnection[];
}

export interface SnsConnectUrlResponse {
  url: string;
}

/** PAYCO disconnect는 legacy raw `"0"` 성공을 JSON으로 감싼 계약. */
export interface PaycoDisconnectResponse {
  result: string;
}

/** KAKAO/NAVER disconnect legacy JSON. */
export interface SnsDisconnectResponse {
  code: string;
  msg: string;
}
