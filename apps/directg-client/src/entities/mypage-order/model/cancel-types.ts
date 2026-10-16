/**
 * 취소요청 내역 (legacy `Mypage2::getOrderList_v2` — status 7·8 필터) + 요청철회(`mypage_proc.php`).
 * 계약: `GET /api/mypage/orders/cancel-requests`, `POST /api/mypage/orders/request-return`.
 * 문서: docs/migration/storefront/mypage/cancel-request-list.md
 */
export interface CancelRequestItem {
  /** 표시용 주문일자(b.order_date). */
  order_date: string;
  ordno: string;
  settle_no: string;
  product_name: string;
  price: number;
  /** "1" 코드발송 / "2" 택배발송 / "3" 코드+택배발송. */
  delivery_type: string;
  /** tbl_order_item.status ("7"·"8"). getOrderStatus 라벨 + 요청철회(8) 조건. */
  status: string;
  /** getOrderShipment.shipment_status — delivery_type≠1일 때만, 그 외 null. */
  shipment_status: string | null;
}

export interface MypageCancelRequestResponse {
  list: CancelRequestItem[];
  page: number;
  totalPages: number;
}

/** 요청철회 요청 (legacy mypage_proc requestReturn). */
export interface RequestReturnRequest {
  settle_no: string;
  ordno: string;
}

export interface RequestReturnResponse {
  success: boolean;
  message: string;
}
