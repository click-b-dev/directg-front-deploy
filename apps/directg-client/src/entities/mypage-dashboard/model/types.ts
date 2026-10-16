/**
 * 마이페이지 대시보드 데이터 (legacy `pc/mypage/mypage_main.html` — Order/Mypage2 집계).
 * 백엔드 계약: `GET /api/mypage/dashboard` (쿠키 세션 → m_no, 최근 1개월).
 * 문서: docs/migration/storefront/mypage/mypage-main.md
 */

/** 주문/취소 집계 (건수 cc, 금액 ss). */
export interface MypageOrderStat {
  cc: number;
  ss: number;
}

/** 최근 주문완료 행. */
export interface MypageOrderRow {
  order_date: string;
  ordno: string;
  delivery_type: "1" | "2" | "3";
  product_name: string;
  price: number;
  /** 코드발송(delivery_type=1) 수령 여부. "1"=구매확정, 그외=수령대기. */
  is_actv: string;
  /** 배송상태 라벨(delivery_type≠1). 백엔드 getShipmentStatus 결과. */
  shipment_status_label?: string;
  settle_no: string;
}

/** 최근 취소완료 행. */
export interface MypageCancelRow {
  cancel_date: string;
  ordno: string;
  product_name: string;
  price: number;
  settle_no: string;
}

/** 최근 포인트 행. */
export interface MypagePointRow {
  regdt: string;
  /** "+"=적립, "-"=사용. */
  emoney_type: string;
  memo: string;
  amt_delta: number;
}

export interface MypageDashboard {
  member_emoney: number;
  order_info: MypageOrderStat;
  cancel_info: MypageOrderStat;
  order_list: MypageOrderRow[];
  cancel_list: MypageCancelRow[];
  point_list: MypagePointRow[];
}
