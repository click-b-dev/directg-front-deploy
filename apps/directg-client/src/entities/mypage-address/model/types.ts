/**
 * 배송지 (legacy `tbl_member_address` — Mypage::getMemberAddress / address_proc).
 * 계약: `GET /api/mypage/address`, `POST /api/mypage/address`.
 * 문서: docs/migration/storefront/mypage/address.md
 */
export interface MemberAddress {
  name: string;
  zipcode: string;
  address: string;
  address_detail: string;
  phone: string;
  message: string;
}

/** 배송지 저장 응답 (legacy mode=setaddress). */
export interface AddressSaveResponse {
  error_code: "OK" | "NG";
  error_msg: string;
}
