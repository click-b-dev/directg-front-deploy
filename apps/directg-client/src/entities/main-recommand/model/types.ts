import type { ProductThumb } from "@entities/product-thumb";

/**
 * 추천·특집 (legacy `tbl_main_recommand`).
 * 백엔드 계약: `GET /api/main/recommendations` — docs/migration/storefront/main/game-lists.md
 */
export interface MainRecommand {
  idx: number;
  recommand_name: string;
  recommand_banner: string;
  recommand_banner_link: string;
  recommand_banner_target: string;
  /** recommand_goods_1~4 상품(최대 4) */
  recommand_goods: ProductThumb[];
}
