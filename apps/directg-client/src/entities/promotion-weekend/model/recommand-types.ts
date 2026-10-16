/**
 * 주말특가 DG 추천게임 (legacy promotion_weekend.html W-2, promotion_week_recommand).
 * 계약: `GET /api/promotion/weekend/recommand`. 옵션정보 파생은 백엔드.
 * 문서: docs/migration/storefront/promotion/promotion-weekend.md
 */
export interface WeekendRecommandGame {
  /** title_info.sku — game_view product_id. */
  sku: string;
  /** title_info.title_id — hero_capsule 이미지 경로. */
  title_id: string;
  /** title_info.domain — 이미지 도메인. */
  domain: string;
  /** option_info.product_name. */
  product_name: string;
  /** title_info.title_name — 모바일 W-2 카드 헤더/alt용(PC/season RecommandCard는 product_name 사용, optional). */
  title_name?: string;
  consumer_price: number;
  price: number;
  discount: number;
  /** 파생: sale_price>0 → "Y"/bg-danger, else "N"/bg-primary. */
  is_promotion: string;
  promotion_label: string;
}

export interface WeekendRecommandResponse {
  list: WeekendRecommandGame[];
}
