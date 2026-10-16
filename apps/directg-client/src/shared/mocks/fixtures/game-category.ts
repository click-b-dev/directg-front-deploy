import type { ProductThumb } from "@entities/product-thumb";

import { makeProductThumb } from "./product-thumb-sample";

/**
 * 개발용 fixture — `GET /api/game/category`. legacy getGoodsList2(category_code 필터) 형태.
 * 프로모션/일반 혼합(is_promotion 미고정 — category는 전체 상품). 카드 분기 커버.
 */
export const gameCategoryFixture: ProductThumb[] = [
  makeProductThumb({
    product_code: 4001,
    product_name: "발더스 게이트 3",
    goods_sku: "SKU-4001",
    view_url: "/game/game_view?product_id=4001&sku=SKU-4001&platform=1",
    is_promotion: "Y",
    promotion_end: "2026-09-25",
    promotion_label: "bg-danger",
    discount: 20,
    consumer_price: 66000,
    price: 52800,
    interface_korean: "Y",
    exclusive_korean: "Y",
  }),
  makeProductThumb({
    product_code: 4002,
    product_name: "엘든 링",
    goods_sku: "SKU-4002",
    view_url: "/game/game_view?product_id=4002&sku=SKU-4002&platform=1",
    consumer_price: 64800,
    price: 64800,
    spoken_korean: "Y",
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 4003,
    product_name: "GTA V",
    goods_sku: "SKU-4003",
    view_url: "/game/game_view?product_id=4003&sku=SKU-4003&platform=35",
    is_promotion: "Y",
    promotion_end: "2026-09-28",
    promotion_label: "bg-danger",
    discount: 55,
    consumer_price: 44800,
    price: 20160,
    product_platform: "35",
  }),
  makeProductThumb({
    product_code: 4004,
    product_name: "레드 데드 리뎀션 2",
    goods_sku: "SKU-4004",
    view_url: "/game/game_view?product_id=4004&sku=SKU-4004&platform=1",
    consumer_price: 66000,
    price: 66000,
    interface_korean: "Y",
    soldout: "Y",
  }),
];

/** category_code → tagName mock 맵(legacy getTagName). 미매핑은 기본값. */
export const gameCategoryTagNames: Record<string, string> = {
  C0001001: "싱글 플레이어",
  C0001002: "멀티 플레이어",
  C0001003: "온라인 PvP",
  C0001004: "온라인 협동",
};
