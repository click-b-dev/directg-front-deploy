import type { OrderComplete } from "@entities/order";

/**
 * 개발용 fixture — `GET /api/order/complete`. legacy getOrder+getOrderItem+enrich 재현.
 * 일반 결제(toss_pay·포인트할인) 케이스. 가상계좌(SC0040) 검증은 payment_method="SC0040"+payment_log 지정.
 */
export const orderCompleteFixture: OrderComplete = {
  order_info: {
    settle_no: "S20260911001",
    pg_provider: "toss",
    payment_method: "toss_pay",
    step: "1",
    checkout_status: "결제완료",
    payment_date: "2026-09-11 14:30:00",
    use_emoney: 5000,
    total_price: 94000,
  },
  items: [
    {
      ordno: "20260911-0001",
      product_code: "2001",
      product_name: "발더스 게이트 3",
      delivery_type: "1",
      goods_price: 66000,
      price: 52800,
      game_type: "game",
      display_type: "basic",
      product_platform: "1",
      goods_sku: "SKU-2001",
    },
    {
      ordno: "20260911-0002",
      product_code: "2003",
      product_name: "P의 거짓",
      delivery_type: "1",
      goods_price: 66000,
      price: 46200,
      game_type: "game",
      display_type: "edition",
      product_platform: "34",
      goods_sku: "SKU-2003",
    },
  ],
  payment_log: null,
};
