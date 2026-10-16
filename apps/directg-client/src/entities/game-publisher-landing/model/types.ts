import type { ProductThumb } from "@entities/product-thumb";

/**
 * 퍼블리셔 랜딩 목록 (legacy `mobile/game/publisher_<brand>.html` — `Goods::getPublisherGoodsSearch`).
 * 계약: `GET /api/game/publisher-landing`. supplier_code + preorder/bonus 기간 + genre/platform/category MATCH + sort.
 * 카드 필드는 product-thumb ProductThumb 재사용. 문서: docs/migration/storefront/mobile/publisher-landing.md
 */
export interface PublisherLandingResponse {
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(total_results, "총: N 개"). */
  total: number;
}
