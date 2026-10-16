/**
 * 주문 내역 상세보기 (legacy `Mypage::getOrderV2`/`getOrderItemV2` + PG bill URL, 리뉴얼 DB).
 * 계약: `GET /api/mypage/orders/view`, `POST /api/mypage/orders/{licence,activate,cancel}`.
 * 문서: docs/migration/storefront/mobile/mypage-order-view.md
 */
export interface OrderViewOrder {
  settle_no: string;
  /** 최종 결제금액(tbl_order.total_price). */
  total_price: number;
  /** 포인트 할인. */
  use_emoney: number;
  /** 캐시 할인. */
  use_cash: number;
  /** 회원 즉시할인. */
  member_dc: number;
  pg_provider: string;
  /** 결제수단 코드(getPaymentMethod 맵). */
  payment_method: string;
  /** 결제상태 코드(getCheckoutStatus 맵). step=="2" 결제완료. */
  step: string;
  payment_date: string;
  /** 구매영수증 URL(백엔드 계산, version=3 & PG별). step=="2"일 때만 표시. version 1·2는 빈값. */
  bill_url: string;
  /**
   * 입금대기 가상계좌(SC0040) 정보 — mypage_order_wating_view 증분(optional).
   * 백엔드가 settle_log(kcp/payco)에서 조립. payment_method="SC0040" && 입금대기일 때만 존재.
   */
  deposit?: {
    /** settle_log.amount — 결제금액. */
    amount: number;
    /** va_name — 입금자. */
    va_name: string;
    /** 입금은행. */
    bank_name: string;
    /** 계좌번호. */
    account: string;
    /** 예금주. */
    depositor: string;
    /** 마감기한(ISO, 프론트 'm월 d일 HH:mm' 포맷). */
    va_date: string;
  };
}

export interface OrderViewItem {
  ordno: string;
  order_date: string;
  product_name: string;
  price: number;
  /** getOrderStatus 코드: 1 주문대기/2 주문완료/8 취소요청/9 취소완료 등. */
  status: string;
  /** status=1에서 "fail"이면 발송오류. */
  send_status: string;
  /** "1"=활성화(수령)완료 → 키 확인 노출. */
  is_actv: string;
  /** getDeliveryType: "1" 코드 / "2" 택배 / "3" 코드+택배. */
  delivery_type: string;
  /** 키 확인/활성화 order_system(Asset/Ztorm/Genba/Vaultn/PointNexus). */
  order_system: string;
  /** status=9 취소일자. */
  cancel_date: string;
  /** 택배 배송상태(delivery_type≠1, getOrderShipment). getShipmentStatus 맵. */
  shipment_status: string;
  tracking_number: string;
  delivery_code: string;
}

export interface MypageOrderViewResponse {
  order: OrderViewOrder;
  items: OrderViewItem[];
}

/** 키 확인(getXxxLicence) 응답 — 제품키 HTML. */
export interface OrderLicenceResponse {
  html: string;
}

/** 키 활성화(setXxxActivate)·주문취소요청(order_cancel) 공통 응답. */
export interface OrderMutationResponse {
  /** 활성화: "99"=실패. 취소: "OK"=접수. */
  error_code: string;
  error_msg: string;
}

/** 주문취소요청 payload (legacy order_cancel_proc serializeArray). */
export interface OrderCancelRequest {
  settle_no: string;
  ordno: string;
  product_name: string;
  /** legacy hidden order_status(JS 미설정 → 빈값). */
  order_status: string;
  /** 환불계좌(payment_method SC0040/SC0030/toss_bank일 때). */
  message3?: string;
  message4?: string;
  message5?: string;
}
