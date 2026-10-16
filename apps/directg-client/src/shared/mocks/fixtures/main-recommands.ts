import type { MainRecommand } from "@entities/main-recommand";
import { makeProductThumb } from "./product-thumb-sample";

/** 개발용 fixture — `GET /api/main/recommendations`. legacy getMainRecommand() 형태 재현. */
export const mainRecommandsFixture: MainRecommand[] = [
  {
    idx: 1,
    recommand_name: "이번 주 추천작",
    recommand_banner: "https://image.directg.net/sample-recommand-1",
    recommand_banner_link: "/game/group_thumb?idx=1",
    recommand_banner_target: "_self",
    recommand_goods: [
      makeProductThumb({
        product_code: 2001,
        product_name: "발더스 게이트 3",
        goods_sku: "SKU-2001",
        view_url: "/game/game_view?product_id=2001&sku=SKU-2001&platform=1",
        is_promotion: "Y",
        promotion_end: "2026-09-15",
        promotion_label: "bg-danger",
        discount: 20,
        consumer_price: 66000,
        price: 52800,
        interface_korean: "Y",
      }),
      makeProductThumb({
        product_code: 2002,
        product_name: "몬스터 헌터 와일즈",
        goods_sku: "SKU-2002",
        view_url: "/game/game_view?product_id=2002&sku=SKU-2002&platform=34",
        consumer_price: 79800,
        price: 79800,
        spoken_korean: "Y",
        interface_korean: "Y",
        product_platform: "34",
      }),
      makeProductThumb({
        product_code: 2003,
        product_name: "P의 거짓",
        goods_sku: "SKU-2003",
        view_url: "/game/game_view?product_id=2003&sku=SKU-2003&platform=1",
        is_promotion: "Y",
        promotion_end: "2026-09-10",
        promotion_label: "bg-danger",
        discount: 30,
        consumer_price: 66000,
        price: 46200,
        interface_korean: "Y",
      }),
      makeProductThumb({
        product_code: 2004,
        product_name: "엘든 링",
        goods_sku: "SKU-2004",
        view_url: "/game/game_view?product_id=2004&sku=SKU-2004&platform=1",
        consumer_price: 64800,
        price: 64800,
        exclusive_korean: "Y",
      }),
    ],
  },
];
