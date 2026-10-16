import type { MypageDashboard } from "@entities/mypage-dashboard";

/** 마이페이지 대시보드 mock (legacy mypage_main 집계/목록 형태 재현). */
export const mypageDashboardFixture: MypageDashboard = {
  member_emoney: 12500,
  order_info: { cc: 3, ss: 89000 },
  cancel_info: { cc: 1, ss: 20000 },
  order_list: [
    {
      order_date: "2026-08-30 14:20:11",
      ordno: "20260830-000123",
      delivery_type: "1",
      product_name: "테스트 게임 디럭스 에디션",
      price: 49000,
      is_actv: "1",
      settle_no: "S100001",
    },
    {
      order_date: "2026-08-25 09:03:47",
      ordno: "20260825-000098",
      delivery_type: "2",
      product_name: "테스트 게임 굿즈 세트",
      price: 40000,
      is_actv: "0",
      shipment_status_label: "배송중",
      settle_no: "S100002",
    },
  ],
  cancel_list: [
    {
      cancel_date: "2026-08-28 18:41:02",
      ordno: "20260827-000110",
      product_name: "테스트 게임 시즌패스",
      price: 20000,
      settle_no: "S100003",
    },
  ],
  point_list: [
    {
      regdt: "2026-08-30 14:20:12",
      emoney_type: "+",
      memo: "구매 적립",
      amt_delta: 490,
    },
    {
      regdt: "2026-08-20 11:10:33",
      emoney_type: "-",
      memo: "주문 사용",
      amt_delta: 1000,
    },
  ],
};
