/**
 * 주문완료 내역 (legacy `tbl_order` ⋈ `tbl_order_item` — Mypage2::getOrderList_v2 + Goods/Order enrich).
 * 계약: `GET /api/mypage/orders`.
 * 문서: docs/migration/storefront/mypage/order-list.md
 */
export interface MypageOrderItem {
  /** 표시용 주문일자(b.order_date). */
  order_date: string;
  ordno: string;
  settle_no: string;
  product_code: string;
  product_name: string;
  price: number;
  /** "1" 코드발송 / "2" 택배발송 / "3" 코드+택배발송. */
  delivery_type: string;
  /** tbl_order.step. */
  step: string;
  /** tbl_order_item.status. */
  status: string;
  /** tbl_order_item.send_status ("fail" 등). */
  send_status: string;
  /** "1"=구매확정 / else 수령대기. */
  is_actv: string;
  /** getGoodsItemDetail — 썸네일 도메인. */
  domain: string;
  game_type: string;
  display_type: string;
  product_platform: string;
  /** getOrderShipment.shipment_status — delivery_type≠1일 때만, 그 외 null. */
  shipment_status: string | null;
}

export interface MypageOrderListResponse {
  list: MypageOrderItem[];
  page: number;
  totalPages: number;
}
