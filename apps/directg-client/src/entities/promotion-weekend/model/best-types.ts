import type { ProductThumb } from "@entities/product-thumb";

/**
 * 주말특가 프로모션 인기게임 (legacy promotion_weekend.html W-3, promotion_week_best).
 * 계약: `GET /api/promotion/weekend/best`. 옵션정보 파생·정규화는 백엔드, 프론트는 ProductThumb 렌더.
 * 문서: docs/migration/storefront/promotion/promotion-weekend.md
 */
export interface WeekendBestResponse {
  /** top4 (legacy key<4) — drawThumb(ProductThumbCard). */
  thumbList: ProductThumb[];
  /** 나머지 (legacy key>=4) — drawGrid(ProductGridCard). */
  gridList: ProductThumb[];
}
