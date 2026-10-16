/** 패키지 옵션 상품 정보 (legacy getGoodsItemDetailSku). */
export interface GamePackageGoodsItem {
  product_code: string;
  product_name: string;
  domain: string;
  goods_sku: string;
  /** 'Y' | 'N' */
  soldout: string;
  release_date: string;
  consumer_price: number;
  price: number;
  discount: number;
  promotion: { sale_price: number; discount_rate: number };
}

/** 대표상품(타이틀) 정보 (legacy getTitleDetail). */
export interface GamePackageTitleInfo {
  /** game_view 링크용 product_id. */
  product_id: string;
  title_name: string;
  developer: string;
  publisher: string;
  /** "10"(전체)|"12"|"15"|"18" 등 — age 이미지. */
  age_limit: string;
  /** 등급 문자열(문자별 "1"이면 grade{i+1}.png). */
  game_rate: string;
  spoken_korean: string;
  interface_korean: string;
  exclusive_korean: string;
}

/**
 * 패키지 옵션 상세 (legacy `mobile/game/game_package_view.html`).
 * 계약: `GET /api/game/package-detail?sku=X`. 백엔드가 getGoodsItemDetailSku + getTitleDetail +
 * getGoodsDescription + getGoodsOptionDescription(Parsedown) + getGoodsOptionPackageInfo + getTagName 조립.
 * 문서: docs/migration/storefront/mobile/game-package-view.md
 */
export interface GamePackageDetailResponse {
  /** 'Y' | 'N' — is_view=Y && status=0 → Y. */
  goods_status: string;
  goods_status_msg: string;
  goods_item: GamePackageGoodsItem;
  title_info: GamePackageTitleInfo;
  /** getGoodsDescription.short_description. */
  short_description: string;
  /** 지역제한 등 안내(빈 문자열이면 미표시). */
  region_msg: string;
  /** getGoodsOptionPackageInfo unit_name 목록. */
  package_units: string[];
  /** getTagName resolve된 장르명. */
  genre_tags: string[];
  /** getTagName resolve된 카테고리명. */
  category_tags: string[];
  /** dgkr_description + description(Parsedown, ##→###) 결합 HTML. */
  description_html: string;
}
