import type { WeekendRecommandGame } from "@entities/promotion-weekend";

/**
 * 개발용 fixture — `GET /api/promotion/weekend/recommand`. legacy promotion_week_recommand 파생 형태.
 * 4열 커스텀 카드(hero_capsule). 파생(할인/label)은 백엔드. 4개(4열 한 행).
 */
export const promotionWeekendRecommandFixture: WeekendRecommandGame[] = [
  {
    sku: "6001",
    title_id: "6001",
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
    sku: "6002",
    title_id: "6002",
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
    sku: "6003",
    title_id: "6003",
    domain: "https://image.directg.net",
    product_name: "몬스터 헌터 와일즈",
    title_name: "몬스터 헌터 와일즈",
    consumer_price: 79800,
    price: 79800,
    discount: 0,
    is_promotion: "N",
    promotion_label: "bg-primary",
  },
  {
    sku: "6004",
    title_id: "6004",
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
