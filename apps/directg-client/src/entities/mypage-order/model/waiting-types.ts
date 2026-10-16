/**
 * 입금대기 내역 (legacy `Mypage2::getOrderList_vbank` — kcp_log/payco_log 조인 + settle_no 그룹핑).
 * 계약: `GET /api/mypage/orders/waiting`.
 * 문서: docs/migration/storefront/mypage/order-waiting-list.md
 */
export interface WaitingOrderItem {
  ordno: string;
  product_name: string;
  product_code: string;
  price: number;
  /** "1" 코드발송 / "2" 택배발송 / "3" 코드+택배발송. */
  delivery_type: string;
  status: string;
  /** getGoodsItemDetail — 플랫폼 아이콘용. */
  product_platform: string;
  /**
   * getOrderShipment.shipment_status — 모바일 입금대기 화면의 delivery_type≠1 배송 배지용(optional).
   * PC 그룹형 화면은 미사용. 미결제 대기 주문은 통상 null.
   */
  shipment_status?: string | null;
}

export interface WaitingOrder {
  /** 가상계좌 PG. kcp(payment_method SC0040) / payco. */
  provider: "kcp" | "payco";
  /** a.ord_ymd(표시용). */
  order_date: string;
  settle_no: string;
  /** 주문 총액(kcp c.amount / payco paymentAmt). */
  amount: number;
  /** tbl_order.step(="1"). */
  step: string;
  bank_name: string;
  account: string;
  /** 예금주(kcp만, payco는 null). */
  depositor: string | null;
  /** 백엔드 판정: now_KST > va_expiry(payco 당일 23:59:59 패딩) → "closed"(입금마감) / "waiting"(입금대기). */
  deposit_status: "waiting" | "closed";
  /** ISO 8601(KST) 입금마감 일시. 백엔드가 kcp datetime/payco YYYYMMDD 정규화. */
  va_date: string;
  items: WaitingOrderItem[];
}

export interface MypageOrderWaitingResponse {
  list: WaitingOrder[];
  page: number;
  totalPages: number;
}
