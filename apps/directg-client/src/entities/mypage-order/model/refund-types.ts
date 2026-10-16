/**
 * 환불(취소) 내역 (legacy `Mypage::getOrderList` — **별도 DGKR DB** step 8·9·99 조회).
 * 계약: `GET /api/mypage/refunds`.
 * 문서: docs/migration/storefront/mypage/refund-list.md
 */
export interface RefundItem {
  settle_no: string;
  /** getOrderItemName 집계 — ">1건이면 '{첫상품} 외 N건'". 백엔드 계산. */
  item_name: string;
  /** 결제수단 코드(settlekind 맵). */
  settlekind: string;
  /** "naverpay"면 결제수단 "네이버페이" 우선. */
  pg_provider: string;
  settleprice: number;
  /** 주문일자(regdt). */
  regdt: string;
  /** 취소일자(canceldt). */
  canceldt: string;
  /** 결제상태 코드(settleStatus 맵). "8"·"9"·"99". */
  step: string;
}

export interface MypageRefundResponse {
  list: RefundItem[];
  page: number;
  totalPages: number;
}
