/**
 * 사은품 내역 (legacy `tbl_event_gift` + `tbl_event_gift_member` — Mypage::getGiftList).
 * 계약: `GET /api/mypage/gift`, `POST /api/mypage/gift/claim`, `POST /api/mypage/gift/licence`.
 * 문서: docs/migration/storefront/mypage/gift.md
 */
export interface GiftItem {
  idx: number;
  title: string;
  gift_nm: string;
  /** "Y"=배송 사은품, "N"=키 지급. */
  is_delivery: string;
  parent_idx: number;
  reserve_id: string;
  tracking_no: string;
  /** "0" 당첨완료 / "1" 발송요청 / "2" 배송중 / "3" 수령완료. */
  status: string;
  ordno: string;
  delivery_code: string;
  /** 입력/수령 기한(빈값 가능). */
  address_enddt: string;
}

export interface GiftListResponse {
  list: GiftItem[];
}

/** 사은품 신청(주소저장/키수령) 요청. legacy gift_proc은 is_delivery/status로 분기. */
export interface GiftClaimRequest {
  idx: number;
  is_delivery: string;
  name?: string;
  zipcode?: string;
  address?: string;
  address_detail?: string;
  tel?: string;
}

export interface GiftClaimResponse {
  msg: string;
}

/** 제품키 조회(getGiftView) 응답. error_code="0"이면 error_msg가 키 HTML. */
export interface GiftLicenceResponse {
  error_code: string;
  error_msg: string;
}
