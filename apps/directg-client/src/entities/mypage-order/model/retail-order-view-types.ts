/**
 * 실물주문 상세보기 (legacy `Mypage::getRetailOrder` + PG 로그, 별도 DGKR DB).
 * 계약: `GET /api/mypage/retail-orders/view`.
 * ⚠️ 백엔드는 m_no=1023882 하드코딩 필터(legacy verbatim, 개발자 승인).
 * 문서: docs/migration/storefront/mypage/retail-order-view.md
 */
export interface RetailOrderDetail {
  settle_no: string;
  goods_code: string;
  goods_nm: string;
  settleprice: number;
  /** 있으면 "키확인" 열 노출 + 안내 문구. */
  reserve_id: string;
  /** 결제상태 코드(retailStepText 맵이나 이 화면은 $statusText 미정의 → 빈값). */
  step: string;
  /** "1"이면 키확인, else 활성화 버튼(dead). */
  is_lic_actv: string;
  asset_id: string;
  ord_ymd: string;
  zipcode: string;
  address: string;
  address_detail: string;
  name: string;
  tracking_no: string;
  message: string;
  phone: string;
  pg_provider: string;
  /** 결제수단 코드(BANK/CARD 등). */
  settlekind: string;
  regdt: string;
  emoney: number;
  coupon: number;
  cash: number;
}

export interface RetailNaverpayLog {
  productName: string;
  cardAuthNo: string;
  paymentId: string;
}

export interface RetailKcpLog {
  app_no: string;
  bank_name: string;
  cash_no: string;
  cash_authno: string;
}

export interface MypageRetailOrderViewResponse {
  order: RetailOrderDetail;
  /** pg_provider==naverpay일 때만. */
  naverpay: RetailNaverpayLog | null;
  /** pg_provider==kcp일 때만. */
  kcp: RetailKcpLog | null;
}
