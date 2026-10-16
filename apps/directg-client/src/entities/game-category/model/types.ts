import type { ProductThumb } from "@entities/product-thumb";

/**
 * 카테고리별 상품 목록 (legacy `Goods::getGoodsList2` + category_code, `Goods::getTagName`).
 * 계약: `GET /api/game/category`. 카드 필드는 product-thumb ProductThumb 재사용.
 * 문서: docs/migration/storefront/game/game-category-thumb.md
 */
export interface GameCategoryResponse {
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(정렬 UI "총 N개"). */
  total: number;
  /** 카테고리명(legacy getTagName(category_code)) — page_title. */
  tagName: string;
}
