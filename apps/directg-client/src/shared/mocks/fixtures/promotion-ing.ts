import type { ProductThumb } from "@entities/product-thumb";

import { makeProductThumb } from "./product-thumb-sample";

/**
 * 개발용 fixture — `GET /api/promotion/ing`. legacy getGoodsList2(is_promotion='Y') 형태.
 * 전부 프로모션(is_promotion=Y·discount>0) 상품. 카드 분기 커버: 플랫폼/장르/한글/품절 등.
 */
export const promotionIngFixture: ProductThumb[] = [
  makeProductThumb({
    product_code: 3001,
    product_name: "사이버펑크 2077: 얼티밋 에디션",
    goods_sku: "SKU-3001",
    view_url: "/game/game_view?product_id=3001&sku=SKU-3001&platform=1",
    is_promotion: "Y",
    promotion_end: "2026-09-20",
    promotion_label: "bg-danger",
    discount: 50,
    consumer_price: 82000,
    price: 41000,
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 3002,
    product_name: "엘든 링 나이트레인",
    goods_sku: "SKU-3002",
    view_url: "/game/game_view?product_id=3002&sku=SKU-3002&platform=1",
    is_promotion: "Y",
    promotion_end: "2026-09-18",
    promotion_label: "bg-danger",
    discount: 25,
    consumer_price: 49000,
    price: 36750,
    spoken_korean: "Y",
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 3003,
    product_name: "GTA V 프리미엄 에디션",
    goods_sku: "SKU-3003",
    view_url: "/game/game_view?product_id=3003&sku=SKU-3003&platform=35",
    is_promotion: "Y",
    promotion_end: "2026-09-30",
    promotion_label: "bg-danger",
    discount: 60,
    consumer_price: 44800,
    price: 17920,
    product_platform: "35",
    display_type: "edition",
  }),
  makeProductThumb({
    product_code: 3004,
    product_name: "발더스 게이트 3 디지털 디럭스 DLC",
    goods_sku: "SKU-3004",
    view_url: "/game/game_view?product_id=3004&sku=SKU-3004&platform=1",
    is_promotion: "Y",
    promotion_end: "2026-09-22",
    promotion_label: "bg-danger",
    discount: 15,
    consumer_price: 12000,
    price: 10200,
    interface_korean: "Y",
    game_type: "dlc",
    display_type: "holomodelsdlc",
    soldout: "Y",
  }),
];
