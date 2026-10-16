import type { ProductThumb } from "@entities/product-thumb";

/**
 * 퍼블리셔별 상품 목록 (legacy `Goods::getGoodsList2` + supplier_code=publisher_code, `getPublisher`).
 * 계약: `GET /api/game/publisher`. 카드 필드는 product-thumb ProductThumb 재사용.
 * 문서: docs/migration/storefront/game/publisher.md
 */
export interface GamePublisherResponse {
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(정렬 UI "총 N개"). */
  total: number;
  /** 퍼블리셔명(legacy getPublisher(publisher_code)) — page_title. */
  publisherName: string;
}
