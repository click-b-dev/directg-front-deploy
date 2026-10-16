/**
 * 쿠폰 내역 (legacy `pc/mypage/mypage_coupon.html` — Mypage::getCouponList / mypage_coupon_proc).
 * 문서: docs/migration/storefront/mypage/mypage-coupon.md
 */
export interface MypageCouponRow {
  regdt: string;
  coupon_name: string;
  coupon_price: number;
}

export interface MypageCouponList {
  list: MypageCouponRow[];
  page: number;
  totalPages: number;
}

/** 쿠폰등록 응답 — legacy는 plain text("성공"/에러) → `{ result }`로 정규화. */
export interface CouponRegisterResponse {
  result: string;
}
