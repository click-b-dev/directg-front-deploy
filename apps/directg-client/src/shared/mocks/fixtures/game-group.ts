import type { ProductThumb } from "@entities/product-thumb";

import { makeProductThumb } from "./product-thumb-sample";

/**
 * 개발용 fixture — `GET /api/game/group`. legacy getGoodsGroupList(tbl_group_item) 형태.
 * 그룹 소속 상품(번들 세일 등). access/subject/banner는 handler에서 idx로 판정.
 */
export const gameGroupFixture: ProductThumb[] = [
  makeProductThumb({
    product_code: 7001,
    product_name: "번들 세일 - 발더스 게이트 3",
    goods_sku: "SKU-7001",
    view_url: "/game/game_view?product_id=7001&sku=SKU-7001&platform=1",
    is_promotion: "Y",
    promotion_end: "2026-09-30",
    promotion_label: "bg-danger",
    discount: 25,
    consumer_price: 66000,
    price: 49500,
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 7002,
    product_name: "번들 세일 - 엘든 링",
    goods_sku: "SKU-7002",
    view_url: "/game/game_view?product_id=7002&sku=SKU-7002&platform=1",
    consumer_price: 64800,
    price: 64800,
    spoken_korean: "Y",
    interface_korean: "Y",
  }),
];

/** 개발용 그룹 설정(subject/banner). idx 있으면 ok, 없으면 invalid로 handler가 판정. */
export const gameGroupInfo = {
  subject: "겨울 번들 세일",
  banner: "",
  bannerDomain: "",
};
