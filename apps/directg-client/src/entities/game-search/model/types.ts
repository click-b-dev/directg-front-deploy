import type { ProductThumb } from "@entities/product-thumb";

/**
 * 통합검색 결과 (legacy `mobile/game/game_search.html` — `Goods::getGoodsSearch`/`getGoodsPromotionSearch`, MATCH BOOLEAN).
 * 계약: `GET /api/game/search`. 카드 필드는 product-thumb ProductThumb 재사용(view_url/가격/배지 백엔드 제공).
 * 문서: docs/migration/storefront/mobile/game-search.md
 */
export interface GameSearchResponse {
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(total_results, "총 N 개"). */
  total: number;
}
