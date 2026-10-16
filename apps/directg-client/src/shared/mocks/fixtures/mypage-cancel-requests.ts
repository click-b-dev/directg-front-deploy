import type { CancelRequestItem } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/orders/cancel-requests`) 준비 전 주입.
 * legacy getOrderList_v2(status 7·8) 결과 형태. 분기 커버:
 * status 8(취소요청/danger/요청철회 버튼) / status 7(빈 라벨/secondary/버튼 없음) / 택배(배송상태).
 */
export const mypageCancelRequestsFixture: CancelRequestItem[] = [
  {
    // status 8: 취소요청(danger) + 요청철회 버튼 + 코드발송
    order_date: "2026-09-01",
    ordno: "20260901000001",
    settle_no: "SETTLE-C001",
    product_name: "사이버펑크 2077: 얼티밋 에디션",
    price: 35900,
    delivery_type: "1",
    status: "8",
    shipment_status: null,
  },
  {
    // status 7: 라벨 없음(빈값)/secondary + 버튼 없음 + 택배발송(배송상태 표기)
    order_date: "2026-08-24",
    ordno: "20260824000002",
    settle_no: "SETTLE-C002",
    product_name: "레지던트 이블 4 리메이크 (실물)",
    price: 66000,
    delivery_type: "2",
    status: "7",
    shipment_status: "2",
  },
  {
    // status 8: 취소요청 + 요청철회 버튼 + 코드+택배(배송상태)
    order_date: "2026-08-12",
    ordno: "20260812000003",
    settle_no: "SETTLE-C003",
    product_name: "발더스 게이트 3 디지털 딜럭스",
    price: 66000,
    delivery_type: "3",
    status: "8",
    shipment_status: "4",
  },
];
