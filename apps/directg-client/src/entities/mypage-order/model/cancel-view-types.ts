/**
 * 취소완료 상세보기 (legacy `Mypage::getOrderV2`/`getOrderItemV2` + `Order::getOrderAddress`, 리뉴얼 DB).
 * 계약: `GET /api/mypage/orders/cancel-view`.
 * 문서: docs/migration/storefront/mypage/cancel-view.md
 */
export interface CancelViewOrder {
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
  /** 결제상태 코드(getCheckoutStatus 맵). */
  step: string;
  payment_date: string;
}

export interface CancelViewItem {
  ordno: string;
  product_name: string;
  price: number;
  /** "1" 코드발송 / "2" 택배발송 / "3" 코드+택배발송(getDeliveryType 맵). */
  delivery_type: string;
  /** getOrderStatus 라벨. status==9면 취소일자 표기. */
  status: string;
  cancel_date: string;
}

export interface CancelViewAddress {
  zipcode: string;
  address: string;
  address_detail: string;
  name: string;
  tel: string;
  msg: string;
}

export interface MypageCancelViewResponse {
  order: CancelViewOrder;
  items: CancelViewItem[];
  /** 배송지(없거나 zipcode 빈값이면 null). */
  address: CancelViewAddress | null;
}
