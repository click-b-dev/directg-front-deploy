/**
 * 포인트 내역 (legacy `pc/mypage/mypage_point.html` — Mypage::getPointList).
 * 계약: `GET /api/mypage/points?page=N`. 문서: docs/migration/storefront/mypage/mypage-point.md
 */
export interface MypagePointRow {
  regdt: string;
  /** "+"=적립, "-"=사용. */
  emoney_type: string;
  memo: string;
  amt_delta: number;
}

export interface MypagePointList {
  member_emoney: number;
  list: MypagePointRow[];
  page: number;
  totalPages: number;
}
