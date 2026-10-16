import type { ProductThumb } from "@entities/product-thumb";
import { makeProductThumb } from "./product-thumb-sample";

/** 개발용 fixture — `GET /api/main/spoken-korean`. legacy getGoodsSpokenKorean(5) 형태. */
export const spokenKoreanGamesFixture: ProductThumb[] = [
  makeProductThumb({
    product_code: 5001,
    product_name: "발더스 게이트 3",
    goods_sku: "SKU-5001",
    view_url: "/game/game_view?product_id=5001&sku=SKU-5001&platform=1",
    spoken_korean: "Y",
    interface_korean: "Y",
    is_promotion: "Y",
    promotion_end: "2026-09-15",
    promotion_label: "bg-danger",
    discount: 20,
    consumer_price: 66000,
    price: 52800,
  }),
  makeProductThumb({
    product_code: 5002,
    product_name: "사이버펑크 2077",
    goods_sku: "SKU-5002",
    view_url: "/game/game_view?product_id=5002&sku=SKU-5002&platform=34",
    spoken_korean: "Y",
    interface_korean: "Y",
    consumer_price: 66000,
    price: 66000,
    product_platform: "34",
  }),
  makeProductThumb({
    product_code: 5003,
    product_name: "P의 거짓",
    goods_sku: "SKU-5003",
    view_url: "/game/game_view?product_id=5003&sku=SKU-5003&platform=1",
    spoken_korean: "Y",
    interface_korean: "Y",
    is_naverpay_coupon: "Y",
    consumer_price: 66000,
    price: 66000,
  }),
];

/** 개발용 fixture — `GET /api/main/exclusive-korean`. legacy getGoodsExclusiveKorean(5) 형태. */
export const exclusiveKoreanGamesFixture: ProductThumb[] = [
  makeProductThumb({
    product_code: 6001,
    product_name: "엘든 링",
    goods_sku: "SKU-6001",
    view_url: "/game/game_view?product_id=6001&sku=SKU-6001&platform=1",
    exclusive_korean: "Y",
    consumer_price: 64800,
    price: 64800,
  }),
  makeProductThumb({
    product_code: 6002,
    product_name: "메타포: 리판타지오",
    goods_sku: "SKU-6002",
    view_url: "/game/game_view?product_id=6002&sku=SKU-6002&platform=1",
    exclusive_korean: "Y",
    is_promotion: "Y",
    promotion_end: "2026-09-30",
    promotion_label: "bg-danger",
    discount: 15,
    consumer_price: 69800,
    price: 59330,
  }),
  makeProductThumb({
    product_code: 6003,
    product_name: "스타듀 밸리",
    goods_sku: "SKU-6003",
    view_url: "/game/game_view?product_id=6003&sku=SKU-6003&platform=34",
    exclusive_korean: "Y",
    consumer_price: 16000,
    price: 16000,
    product_platform: "34",
  }),
];
