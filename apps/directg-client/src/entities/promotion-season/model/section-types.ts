import type { ProductThumb } from "@entities/product-thumb";

/**
 * 시즌 프로모션 섹션 응답 (legacy promotion_season.html S-5~S-7).
 * 문서: docs/migration/storefront/promotion/promotion-season.md
 */

/** S-5 역대 최대할인 / S-6 추가 포인트: 전체보기 배너 링크 + drawThumb 목록. */
export interface SeasonBannerListResponse {
  /** 전체보기 링크(promotion_max_discount_link / promotion_add_repay_link). */
  bannerLink: string;
  list: ProductThumb[];
}

/** S-7 가격대: 5천원 미만 / 1만원 미만 게임(drawSmallList). */
export interface SeasonPricesResponse {
  price5000: ProductThumb[];
  price10000: ProductThumb[];
}
