import type { GenreBestTitle } from "@entities/game-genre";
import type { ProductThumb } from "@entities/product-thumb";

import { makeProductThumb } from "./product-thumb-sample";

/**
 * 개발용 fixture — `GET /api/game/genre`. legacy getGoodsList2(genre_code FULLTEXT) 형태.
 * 장르 목록(액션 등) 상품. 카드 분기(프로모션/한국어/플랫폼) 커버.
 */
export const gameGenreFixture: ProductThumb[] = [
  makeProductThumb({
    product_code: 5001,
    product_name: "엘든 링",
    goods_sku: "SKU-5001",
    view_url: "/game/game_view?product_id=5001&sku=SKU-5001&platform=1",
    is_promotion: "Y",
    promotion_end: "2026-09-30",
    promotion_label: "bg-danger",
    discount: 15,
    consumer_price: 64800,
    price: 55080,
    spoken_korean: "Y",
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 5002,
    product_name: "세키로",
    goods_sku: "SKU-5002",
    view_url: "/game/game_view?product_id=5002&sku=SKU-5002&platform=1",
    consumer_price: 62800,
    price: 62800,
    interface_korean: "Y",
  }),
  makeProductThumb({
    product_code: 5003,
    product_name: "GTA V",
    goods_sku: "SKU-5003",
    view_url: "/game/game_view?product_id=5003&sku=SKU-5003&platform=35",
    is_promotion: "Y",
    promotion_end: "2026-10-05",
    promotion_label: "bg-danger",
    discount: 50,
    consumer_price: 44800,
    price: 22400,
    product_platform: "35",
  }),
];

/** 장르 베스트 캐러셀 fixture (legacy getGenreBestTitle 상위 5). */
export const gameGenreBestTitlesFixture: GenreBestTitle[] = [
  {
    domain: "",
    titleId: "T5001",
    titleName: "엘든 링",
    releaseDate: "2022-02-25",
    genres: [
      { code: "G0003", name: "RPG" },
      { code: "G0001", name: "액션" },
    ],
    categories: [{ code: "C0001001", name: "싱글플레이어" }],
  },
  {
    domain: "",
    titleId: "T5003",
    titleName: "GTA V",
    releaseDate: "2015-04-14",
    genres: [{ code: "G0001", name: "액션" }],
    categories: [
      { code: "C0001001", name: "싱글플레이어" },
      { code: "C0001002", name: "멀티플레이어" },
    ],
  },
];

/** genre_code → 장르명(legacy getPrimaryGenreName). */
export const gameGenreNames: Record<string, string> = {
  G0001: "액션",
  G0002: "어드벤처",
  G0003: "RPG",
  G0004: "전략",
  G0005: "시뮬레이션",
  G0006: "스포츠",
  G0007: "캐주얼",
  G0008: "인디",
  G0009: "앞서 해보기",
  G0010: "레이싱",
};
