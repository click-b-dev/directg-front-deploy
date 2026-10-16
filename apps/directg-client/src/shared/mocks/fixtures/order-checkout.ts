import type { OrderCheckout } from "@entities/order";

/**
 * 개발용 fixture — `GET /api/order/checkout`. legacy getOrderItemList(선택) + emoney + address 재현.
 * 실물 포함(배송지 노출)·total_price>=3000(포인트 노출)·프로모션/상시할인/정가 분기 검증용.
 */
export const orderCheckoutFixture: OrderCheckout = {
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
    {
      product_code: "2004",
      goods_sku: "SKU-2004",
      product_name: "홀로모델 피규어 세트",
      game_type: "holomodels",
      display_type: "holomodels",
      product_platform: "51",
      delivery_type: "2",
      spoken_korean: "N",
      is_preorder: "Y",
      is_bonus: "N",
      consumer_price: 129000,
      price: 129000,
      discount: 0,
      promotion: null,
    },
  ],
  member_emoney: 5300,
  member_address: {
    name: "홍길동",
    zipcode: "06192",
    address: "서울특별시 강남구 테헤란로 521 (삼성동)",
    address_detail: "파르나스타워 3층",
    phone: "010-1234-5678",
    message: "부재 시 문 앞에 놓아주세요",
  },
  is_delivery_address: true,
};
