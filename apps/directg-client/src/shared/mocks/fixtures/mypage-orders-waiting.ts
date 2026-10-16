import type { WaitingOrder } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/orders/waiting`) 준비 전 주입.
 * legacy getOrderList_vbank + settle_no 그룹핑 결과 형태. 분기 커버:
 * kcp(예금주+입금대기) / payco(입금마감) / 멀티아이템(hr) / 플랫폼·delivery_type.
 */
export const mypageOrdersWaitingFixture: WaitingOrder[] = [
  {
    // kcp + 입금대기(waiting) + 예금주 + 단일 아이템 + steam + 코드발송
    provider: "kcp",
    order_date: "2026-09-02",
    settle_no: "VBANK-KCP-0001",
    amount: 35900,
    step: "1",
    bank_name: "국민은행",
    account: "12345678901234",
    depositor: "홍길동",
    deposit_status: "waiting",
    va_date: "2026-09-10T23:59:59",
    items: [
      {
        ordno: "20260902000001",
        product_name: "사이버펑크 2077: 얼티밋 에디션",
        product_code: "PC-GAME-1001",
        price: 35900,
        delivery_type: "1",
        status: "3",
        product_platform: "1",
      },
    ],
  },
  {
    // payco + 입금마감(closed) + 멀티 아이템(hr) + epic/rockstar + 택배/코드+택배
    provider: "payco",
    order_date: "2026-08-25",
    settle_no: "VBANK-PAYCO-0002",
    amount: 120000,
    step: "1",
    bank_name: "신한은행",
    account: "110123456789",
    depositor: null,
    deposit_status: "closed",
    va_date: "2026-08-27T23:59:59",
    items: [
      {
        ordno: "20260825000002",
        product_name: "발더스 게이트 3 디지털 딜럭스",
        product_code: "PC-GAME-1002",
        price: 66000,
        delivery_type: "2",
        status: "3",
        product_platform: "34",
      },
      {
        ordno: "20260825000003",
        product_name: "레드 데드 리뎀션 2: 얼티밋 에디션",
        product_code: "PC-GAME-1003",
        price: 54000,
        delivery_type: "3",
        status: "3",
        product_platform: "35",
      },
    ],
  },
];
