import type { ProductThumb } from "@entities/product-thumb";

/**
 * 전체 게임 목록 (legacy `Goods::getGoodsList2`, category_code/genre_code/q 없음).
 * 계약: `GET /api/game/list`. 카드 필드는 product-thumb ProductThumb 재사용.
 * 문서: docs/migration/storefront/game/game-list.md
 */
export interface GameListResponse {
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(정렬 UI "총 N개"). */
  total: number;
}
