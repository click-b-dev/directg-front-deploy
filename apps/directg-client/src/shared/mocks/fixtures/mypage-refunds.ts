import type { RefundItem } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/refunds`, 별도 DGKR DB) 준비 전 주입.
 * legacy getOrderList(step 8·9·99) + getOrderItemName 집계 결과 형태. 분기 커버:
 * settlekind 다양(가상계좌/신용카드/PAYCO/naverpay) / step(8·9·99) / 상품명 "외 N건".
 */
export const mypageRefundsFixture: RefundItem[] = [
  {
    settle_no: "DG-20260828-0001",
    item_name: "사이버펑크 2077: 얼티밋 에디션",
    settlekind: "SC0010",
    pg_provider: "kcp",
    settleprice: 35900,
    regdt: "2026-08-28 14:22:10",
    canceldt: "2026-08-29 10:05:33",
    step: "9",
  },
  {
    settle_no: "DG-20260820-0002",
    item_name: "발더스 게이트 3 디지털 딜럭스 외 2건",
    settlekind: "SC0040",
    pg_provider: "kcp",
    settleprice: 148000,
    regdt: "2026-08-20 09:11:00",
    canceldt: "2026-08-21 16:40:12",
    step: "99",
  },
  {
    settle_no: "DG-20260815-0003",
    item_name: "엘든 링: 황금 나무의 그림자",
    settlekind: "naverpay",
    pg_provider: "naverpay",
    settleprice: 24700,
    regdt: "2026-08-15 20:03:45",
    canceldt: "2026-08-16 11:20:00",
    step: "8",
  },
  {
    settle_no: "DG-20260810-0004",
    item_name: "GTA V: 프리미엄 에디션",
    settlekind: "PAYCO",
    pg_provider: "payco",
    settleprice: 19900,
    regdt: "2026-08-10 13:30:22",
    canceldt: "2026-08-11 09:00:00",
    step: "9",
  },
];
