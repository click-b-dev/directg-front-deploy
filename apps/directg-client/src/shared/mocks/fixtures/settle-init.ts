import type { SettleInit } from "@entities/order";

/**
 * 개발용 fixture — `GET /api/order/settle-init`. legacy getSettleNo + getOrderItemList(선택) + emoney 재현.
 * settle_no_seq는 getSettleNo 시퀀스(mock 고정). 실물 포함·프로모션/상시할인/정가 분기.
 */
export const settleInitFixture: SettleInit = {
  settle_no_seq: "20260911000001",
  items: [
    {
      product_code: "2001",
      goods_sku: "SKU-2001",
      product_name: "발더스 게이트 3",
      game_type: "game",
      display_type: "basic",
      product_platform: "1",
      delivery_type: "1",
      spoken_korean: "Y",
      is_preorder: "N",
      is_bonus: "N",
      consumer_price: 66000,
      price: 66000,
      discount: 0,
      promotion: { discount_rate: 20, sale_price: 52800 },
    },
    {
      product_code: "2002",
      goods_sku: "SKU-2002",
      product_name: "P의 거짓 디럭스 에디션",
      game_type: "game",
      display_type: "edition",
      product_platform: "34",
      delivery_type: "1",
      spoken_korean: "N",
      is_preorder: "N",
      is_bonus: "Y",
      consumer_price: 79800,
      price: 71820,
      discount: 10,
      promotion: null,
    },
  ],
  member_emoney: 5300,
  buyr_name_fallback: "홍길동",
  shop_user_id: "test@directg.net",
  m_no: "1023882",
};
