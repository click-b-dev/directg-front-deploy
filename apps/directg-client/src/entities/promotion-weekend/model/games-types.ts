import type { ProductThumb } from "@entities/product-thumb";

/**
 * 주말특가 프로모션 게임 목록 (legacy promotion_weekend.html W-5, getPromotionIng 주말특가 기간).
 * 계약: `GET /api/promotion/weekend/games`. drawGrid(ProductGridCard) — ProductThumb 재사용.
 * 문서: docs/migration/storefront/promotion/promotion-weekend.md
 */
export interface WeekendGamesResponse {
  list: ProductThumb[];
}
