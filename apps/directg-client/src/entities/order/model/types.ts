import type { MemberAddress } from "@entities/mypage-address";

/**
 * 주문서 (legacy `pc/order/order.html` — Order::getOrderItemList + Member/Mypage enrich).
 * 계약: `GET /api/order/checkout`. 문서: docs/migration/storefront/order/order.md
 */
export interface OrderPromotion {
  discount_rate: number;
  sale_price: number;
}

export interface OrderItem {
  product_code: string;
  goods_sku: string;
  product_name: string;
  game_type: string;
  display_type: string;
  /** "1" steam | "34" epic | "35" rockstar | "51" holomodels | ... */
  product_platform: string;
  /** "1" 코드 | "2" 택배 | "3" 코드+택배 */
  delivery_type: string;
  /** "Y" | "N" — 음성 한국어 badge. */
  spoken_korean: string;
  is_preorder: string;
  is_bonus: string;
  consumer_price: number;
  /** 상시할인 반영 판매가(백엔드 계산). */
  price: number;
  /** 상시 할인률(백엔드 계산). */
  discount: number;
  /** 프로모션 적용 시 객체, 없으면 null. */
  promotion: OrderPromotion | null;
}

export interface OrderCheckout {
  items: OrderItem[];
  /** 보유 포인트(dgkr DB). */
  member_emoney: number;
  member_address: MemberAddress;
  /** 실물(delivery_type 2·3) 포함 여부 → 배송지 섹션 노출. */
  is_delivery_address: boolean;
}

/**
 * 주문완료 (legacy `pc/order/order_end.html` — getOrder + getOrderItem + getGoodsItemDetail enrich).
 * 계약: `GET /api/order/complete`. 문서: docs/migration/storefront/order/order-end.md
 */
export interface OrderInfo {
  settle_no: string;
  pg_provider: string;
  /** SC0010/SC0030/SC0040/SC0060/PAYCO/toss_bank/POINT/DG0000/toss_pay ... */
  payment_method: string;
  step: string;
  /** getCheckoutStatus(step) 라벨(백엔드 resolve). */
  checkout_status: string;
  payment_date: string;
  /** 사용 포인트(원). */
  use_emoney: number;
  total_price: number;
}

export interface OrderCompleteItem {
  ordno: string;
  product_code: string;
  product_name: string;
  delivery_type: string;
  /** 원가. */
  goods_price: number;
  /** 판매가. */
  price: number;
  game_type: string;
  display_type: string;
  product_platform: string;
  /** gtag purchase item_id. */
  goods_sku: string;
}

/** 가상계좌(SC0040/kcp) 입금 안내 로그. 그 외 결제는 null. */
export interface PaymentLog {
  amount: number;
  va_name: string;
  bank_name: string;
  account: string;
  depositor: string;
  /** YYYYMMDDHHMM… (파싱해 입금마감일시 표시). */
  va_date: string;
}

export interface OrderComplete {
  order_info: OrderInfo;
  items: OrderCompleteItem[];
  payment_log: PaymentLog | null;
}

/**
 * 결제하기 초기 데이터 (legacy `settle.html` 서버 블록 — getSettleNo + getOrderItemList + emoney).
 * 계약: `GET /api/order/settle-init`. 문서: docs/migration/storefront/order/settle.md
 */
export interface SettleInit {
  /** getSettleNo() 시퀀스. settle_no = prefix + 이 값. */
  settle_no_seq: string;
  items: OrderItem[];
  member_emoney: number;
  /** buyr_name 빈값 시 세션 name(없으면 nickname) fallback. */
  buyr_name_fallback: string;
  /** 세션 m_id (shop_user_id/buyr_mail). */
  shop_user_id: string;
  /** 세션 m_no (KCP order_info param_opt_1). */
  m_no: string;
}

/** KCP 예약 응답 (legacy kcp_reserve.php). */
export interface KcpReserveResponse {
  /** "0" 일반 | "1" 가상계좌 | "NG" 미로그인 | "NG_POINT" 포인트초과 */
  code: string;
  res_cd?: string;
  res_msg?: string;
  use_pay_method?: string;
}
