import type { GameDetailResponse, GameOption } from "@entities/game-detail";

import { gameDetailFixture } from "./game-detail";

/**
 * 홀로모델 상세 mock (legacy `pc/game/holomodels_view.html`).
 * game-detail과 동일 shape, 플랫폼 51(HoloModels) 옵션. 비로그인.
 */

const mk = (
  o: Partial<GameOption> & { product_code: number; product_name: string; goods_sku: string },
): GameOption => ({
  product_platform: "51",
  price: 33000,
  consumer_price: 33000,
  discount: 0,
  delivery_type: "1",
  is_bonus: "N",
  is_preorder: "N",
  soldout: "N",
  is_promotion: "N",
  promotion_label: "bg-primary",
  promotion_end: "",
  wishlist_chk: "N",
  ...o,
});

export const holomodelsDetailFixture: GameDetailResponse = {
  ...gameDetailFixture,
  platform: "51",
  platform_name: "HoloModels",
  title_info: {
    ...gameDetailFixture.title_info,
    sku: "sample-holomodels-0001",
    title_id: "sample-holomodels-title-0001",
    title_name: "샘플 홀로모델 본체",
    title_name_en: "Sample HoloModel",
  },
  goods_description: {
    short_description: "샘플 홀로모델 본체 소개입니다.\n두 번째 줄.",
    region_msg: "",
  },
  title_platform: [{ product_platform: "51" }],
  goods_item: {
    "51": {
      game: [
        mk({
          product_code: 9001,
          product_name: "샘플 홀로모델 본체 (HoloModels)",
          goods_sku: "holomodels-game-0001",
          is_promotion: "Y",
          promotion_label: "bg-danger",
          promotion_end: "2026-12-31",
          discount: 10,
          price: 29700,
        }),
      ],
      edition: [
        mk({
          product_code: 9101,
          product_name: "샘플 홀로모델 - 디럭스 에디션",
          goods_sku: "holomodels-edition-0001",
          price: 49000,
          consumer_price: 49000,
        }),
      ],
      dlc: [
        mk({
          product_code: 9201,
          product_name: "샘플 홀로모델 - 확장 코스튬 1",
          goods_sku: "holomodels-dlc-0001",
          price: 9000,
          consumer_price: 9000,
        }),
        mk({
          product_code: 9202,
          product_name: "샘플 홀로모델 - 확장 코스튬 2",
          goods_sku: "holomodels-dlc-0002",
          price: 9000,
          consumer_price: 9000,
        }),
      ],
    },
  },
  is_event_info: "N",
  event_data: null,
  ga4: [
    {
      ...gameDetailFixture.ga4[0],
      item_id: 9001,
      item_name: "샘플 홀로모델 본체 (HoloModels)",
      price: 29700,
      discount: 10,
    },
  ],
};
