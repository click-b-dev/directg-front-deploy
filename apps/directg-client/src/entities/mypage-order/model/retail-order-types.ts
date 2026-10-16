/**
 * 실물 상품 주문 내역 (legacy `Mypage::getRetailOrderList` — **별도 DGKR DB** `retail_order`).
 * 계약: `GET /api/mypage/retail-orders`.
 * 문서: docs/migration/storefront/mypage/retail-order-list.md
 */
export interface RetailOrderItem {
  settle_no: string;
  /** 상품명(retail_order.goods_nm). */
  goods_nm: string;
  /** "naverpay"면 "네이버페이" 선행 표기. */
  pg_provider: string;
  /** 결제수단 코드(retail settlekind 맵: CARD/BANK/POINT/PHONE/GIFT/KAKAOM/NPAY/DGPOINT). */
  settlekind: string;
  settleprice: number;
  /** 주문일자(regdt). */
  regdt: string;
  /** 결제상태 코드(retailStepText 맵). */
  step: string;
}

export interface MypageRetailOrderResponse {
  list: RetailOrderItem[];
  page: number;
  totalPages: number;
}
