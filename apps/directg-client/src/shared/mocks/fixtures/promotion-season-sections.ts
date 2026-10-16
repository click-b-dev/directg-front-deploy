import type { ProductThumb } from "@entities/product-thumb";
import type { SeasonBannerListResponse, SeasonPricesResponse } from "@entities/promotion-season";
import type { WeekendBestResponse, WeekendRecommandGame } from "@entities/promotion-weekend";

import { makeProductThumb } from "./product-thumb-sample";

const g = (n: number, name: string, discount = 30): ProductThumb =>
  makeProductThumb({
    product_code: n,
    product_name: name,
    goods_sku: `SKU-${n}`,
    view_url: `/game/game_view?product_id=${n}`,
    is_promotion: discount > 0 ? "Y" : "N",
    promotion_end: "2026-09-30",
    promotion_label: discount > 0 ? "bg-danger" : "bg-primary",
    discount,
    consumer_price: 60000,
    price: Math.round(60000 * (1 - discount / 100)),
    interface_korean: "Y",
  });

/** S-2 DG 추천게임 (4열). */
export const seasonRecommandFixture: WeekendRecommandGame[] = [
  {
    sku: "8001",
    title_id: "8001",
    domain: "https://image.directg.net",
    product_name: "발더스 게이트 3",
    title_name: "발더스 게이트 3",
    consumer_price: 66000,
    price: 46200,
    discount: 30,
    is_promotion: "Y",
    promotion_label: "bg-danger",
  },
  {
    sku: "8002",
    title_id: "8002",
    domain: "https://image.directg.net",
    product_name: "사이버펑크 2077",
    title_name: "사이버펑크 2077",
    consumer_price: 66000,
    price: 26400,
    discount: 60,
    is_promotion: "Y",
    promotion_label: "bg-danger",
  },
  {
    sku: "8003",
    title_id: "8003",
    domain: "https://image.directg.net",
    product_name: "엘든 링",
    title_name: "엘든 링",
    consumer_price: 64800,
    price: 51840,
    discount: 20,
    is_promotion: "Y",
    promotion_label: "bg-danger",
  },
  {
    sku: "8004",
    title_id: "8004",
    domain: "https://image.directg.net",
    product_name: "P의 거짓",
    title_name: "P의 거짓",
    consumer_price: 62800,
    price: 43960,
    discount: 30,
    is_promotion: "Y",
    promotion_label: "bg-danger",
  },
];

/** S-3 인기게임 (top4 + grid). */
export const seasonBestFixture: WeekendBestResponse = {
  thumbList: [
    g(8101, "몬스터 헌터 와일즈", 15),
    g(8102, "스타필드", 40),
    g(8103, "디아블로 IV", 25),
    g(8104, "호그와트 레거시", 35),
  ],
  gridList: [
    g(8105, "스타듀 밸리", 20),
    g(8106, "하데스", 30),
    g(8107, "테라리아", 10),
    g(8108, "발헤임", 25),
    g(8109, "리스크 오브 레인 2", 40),
    g(8110, "데드 셀", 50),
  ],
};

/** S-5 역대 최대할인 (배너 + 가로 목록). */
export const seasonMaxDiscountFixture: SeasonBannerListResponse = {
  bannerLink: "/promotion/promotion_ing_thumb?is_promotion=Y&sort=discount",
  list: [
    g(8201, "위쳐 3 GOTY", 80),
    g(8202, "GTA V", 70),
    g(8203, "레드 데드 리뎀션 2", 67),
    g(8204, "사이버펑크 2077", 60),
  ],
};

/** S-6 추가 포인트 적립 (배너 + 가로 목록). */
export const seasonAddRepayFixture: SeasonBannerListResponse = {
  bannerLink: "/promotion/promotion_ing_thumb?is_promotion=Y&is_repay=Y",
  list: [
    g(8301, "발더스 게이트 3", 20),
    g(8302, "엘든 링 나이트레인", 25),
    g(8303, "몬스터 헌터 와일즈", 15),
  ],
};

/** S-7 가격대 (5천/1만원 미만). */
export const seasonPricesFixture: SeasonPricesResponse = {
  price5000: [
    makeProductThumb({
      product_code: 8401,
      product_name: "언더테일",
      goods_sku: "SKU-8401",
      view_url: "/game/game_view?product_id=8401",
      is_promotion: "Y",
      promotion_end: "2026-09-30",
      promotion_label: "bg-danger",
      discount: 50,
      consumer_price: 9000,
      price: 4500,
      interface_korean: "Y",
    }),
    makeProductThumb({
      product_code: 8402,
      product_name: "VVVVVV",
      goods_sku: "SKU-8402",
      view_url: "/game/game_view?product_id=8402",
      is_promotion: "Y",
      promotion_end: "2026-09-30",
      promotion_label: "bg-danger",
      discount: 60,
      consumer_price: 6000,
      price: 2400,
    }),
  ],
  price10000: [
    makeProductThumb({
      product_code: 8411,
      product_name: "할로우 나이트",
      goods_sku: "SKU-8411",
      view_url: "/game/game_view?product_id=8411",
      is_promotion: "Y",
      promotion_end: "2026-09-30",
      promotion_label: "bg-danger",
      discount: 40,
      consumer_price: 15500,
      price: 9300,
      interface_korean: "Y",
    }),
    makeProductThumb({
      product_code: 8412,
      product_name: "슬레이 더 스파이어",
      goods_sku: "SKU-8412",
      view_url: "/game/game_view?product_id=8412",
      is_promotion: "Y",
      promotion_end: "2026-09-30",
      promotion_label: "bg-danger",
      discount: 30,
      consumer_price: 12000,
      price: 8400,
    }),
  ],
};

/** S-8 프로모션 게임 목록 (grid). */
export const seasonGamesFixture: ProductThumb[] = [
  g(8501, "발더스 게이트 3", 30),
  g(8502, "엘든 링", 20),
  g(8503, "P의 거짓", 40),
  g(8504, "몬스터 헌터 와일즈", 15),
  g(8505, "스타듀 밸리", 25),
  g(8506, "하데스", 30),
];
