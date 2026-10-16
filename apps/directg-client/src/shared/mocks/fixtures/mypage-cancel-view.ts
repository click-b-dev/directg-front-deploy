import type { MypageCancelViewResponse } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/orders/cancel-view`) 준비 전 주입.
 * legacy getOrderV2/getOrderItemV2 + getOrderAddress(리뉴얼 DB) 결과 형태. 취소완료(status 9) 상세.
 */
export const mypageCancelViewFixture: MypageCancelViewResponse = {
  order: {
    settle_no: "SETTLE-E002",
    total_price: 60000,
    use_emoney: 3000,
    use_cash: 2000,
    member_dc: 1000,
    pg_provider: "kcp",
    payment_method: "SC0010",
    step: "99",
    payment_date: "2026-08-18 13:20:41",
  },
  items: [
    {
      ordno: "20260818000011",
      product_name: "레지던트 이블 4 리메이크 (실물)",
      price: 66000,
      delivery_type: "2",
      status: "9",
      cancel_date: "2026-08-19 10:12:00",
    },
    {
      ordno: "20260818000012",
      product_name: "사이버펑크 2077: 얼티밋 에디션",
      price: 35900,
      delivery_type: "1",
      status: "9",
      cancel_date: "2026-08-19 10:12:00",
    },
  ],
  address: {
    zipcode: "06035",
    address: "서울특별시 강남구 가로수길 5",
    address_detail: "3층 301호",
    name: "홍길동",
    tel: "010-1234-5678",
    msg: "부재 시 문 앞에 놓아주세요.",
  },
};
