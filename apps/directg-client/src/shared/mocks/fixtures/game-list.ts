import type { ProductThumb } from "@entities/product-thumb";

import { makeProductThumb } from "./product-thumb-sample";

/**
 * 개발용 fixture — `GET /api/game/list`. legacy getGoodsList2(전체 게임, category/genre/q 없음) 형태.
 * 프로모션/일반·플랫폼·한국어 혼합으로 카드 분기 커버.
 */
export const gameListFixture: ProductThumb[] = [
  makeProductThumb({
    product_code: 6001,
    product_name: "발더스 게이트 3",
    goods_sku: "SKU-6001",
    view_url: "/game/game_view?product_id=6001&sku=SKU-6001&platform=1",
    is_promotion: "Y",
    promotion_end: "2026-09-30",
    promotion_label: "bg-danger",
    discount: 20,
    consumer_price: 66000,
    price: 52800,
    interface_korean: "Y",
    exclusive_korean: "Y",
  }),
  makeProductThumb({
    product_code: 6002,
    product_name: "사이버펑크 2077",
    goods_sku: "SKU-6002",
    view_url: "/game/game_view?product_id=6002&sku=SKU-6002&platform=1",
    consumer_price: 66800,
    price: 66800,
    spoken_korean: "Y",
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 6003,
    product_name: "레드 데드 리뎀션 2",
    goods_sku: "SKU-6003",
    view_url: "/game/game_view?product_id=6003&sku=SKU-6003&platform=35",
    is_promotion: "Y",
    promotion_end: "2026-10-10",
    promotion_label: "bg-danger",
    discount: 67,
    consumer_price: 62800,
    price: 20724,
    product_platform: "35",
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 6004,
    product_name: "예약구매 신작",
    goods_sku: "SKU-6004",
    view_url: "/game/game_view?product_id=6004&sku=SKU-6004&platform=34",
    consumer_price: 59800,
    price: 59800,
    is_preorder: "Y",
    product_platform: "34",
  }),
];
