import type { MypageOrderViewResponse } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/orders/view`) 준비 전 주입.
 * legacy getOrderV2 + getOrderItemV2 결과 형태. 분기 커버: 코드발송 활성화완료(키확인)/택배 배송중/취소완료/발송오류.
 */
export const mypageOrderViewFixture: MypageOrderViewResponse = {
  order: {
    settle_no: "DG20260825000123",
    total_price: 62800,
    use_emoney: 5000,
    use_cash: 0,
    member_dc: 2000,
    pg_provider: "kcp",
    payment_method: "SC0010",
    step: "2",
    payment_date: "2026-08-25 14:20:11",
    bill_url:
      "https://partner.kcp.co.kr/bill/card?cmd=card_bill&tno=MOCKTNO123&order_no=DG20260825000123&trade_mony=62800",
  },
  items: [
    {
      ordno: "DG20260825000123-1",
      order_date: "2026-08-25 14:20:11",
      product_name: "사이버펑크 2077: 얼티밋 에디션 (Steam)",
      price: 35900,
      status: "2",
      send_status: "success",
      is_actv: "1",
      delivery_type: "1",
      order_system: "Asset",
      cancel_date: "",
      shipment_status: "",
      tracking_number: "",
      delivery_code: "",
    },
    {
      ordno: "DG20260825000123-2",
      order_date: "2026-08-25 14:20:11",
      product_name: "게이밍 마우스패드 (택배)",
      price: 26900,
      status: "2",
      send_status: "success",
      is_actv: "0",
      delivery_type: "2",
      order_system: "Asset",
      cancel_date: "",
      shipment_status: "4",
      tracking_number: "1234567890",
      delivery_code: "002",
    },
  ],
};
