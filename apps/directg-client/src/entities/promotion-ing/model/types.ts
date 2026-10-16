import type { ProductThumb } from "@entities/product-thumb";

/**
 * 할인진행중 목록 (legacy `Goods::getGoodsList2` + `is_promotion='Y'`, `Draw::drawThumb`).
 * 계약: `GET /api/promotion/ing`. 카드 필드는 product-thumb ProductThumb 재사용.
 * 문서: docs/migration/storefront/promotion/promotion-ing-thumb.md
 */
export interface PromotionIngResponse {
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(정렬 UI "총 N개"). legacy goods_list->total_results. */
  total: number;
}

/**
 * 상품 목록 필터 파라미터 (legacy filter_include.php GET 파라미터, 이름 verbatim).
 * 전부 optional. 백엔드가 OR 그룹 결합·장르 FULLTEXT·가격 COALESCE·정렬 수행.
 * 키: is_preorder, is_bonus, is_soldout, game_type_(basic|edition|dlc|music|bundle),
 *     platform_(1|34|35), interface_korean, spoken_korean, exclusive_korean,
 *     genre_code_1~10, min_price, max_price, q, sort.
 */
export type ProductFilterParams = Record<string, string>;
