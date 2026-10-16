import type { CancelEndItem } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/orders/cancel-end`) 준비 전 주입.
 * legacy getOrderList_v2(status 9) 결과 형태. 분기 커버: 코드발송 / 택배(배송상태 bg-info).
 */
export const mypageCancelEndFixture: CancelEndItem[] = [
  {
    // status 9(취소완료/danger) + 코드발송
    order_date: "2026-08-30",
    ordno: "20260830000010",
    settle_no: "SETTLE-E001",
    product_name: "사이버펑크 2077: 얼티밋 에디션",
    price: 35900,
    delivery_type: "1",
    status: "9",
    shipment_status: null,
  },
  {
    // status 9 + 택배발송(배송상태 표기 bg-info)
    order_date: "2026-08-18",
    ordno: "20260818000011",
    settle_no: "SETTLE-E002",
    product_name: "레지던트 이블 4 리메이크 (실물)",
    price: 66000,
    delivery_type: "2",
    status: "9",
    shipment_status: "5",
  },
  {
    // status 9 + 코드+택배
    order_date: "2026-08-05",
    ordno: "20260805000012",
    settle_no: "SETTLE-E003",
    product_name: "발더스 게이트 3 디지털 딜럭스",
    price: 66000,
    delivery_type: "3",
    status: "9",
    shipment_status: "6",
  },
];
