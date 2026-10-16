/**
 * 번들 상세 (legacy `pc/game/bundle_view.html`) 응답 타입.
 * 백엔드가 getGoodsItemDetailSku + getGoodsOptionPackageList + steam JSON(apps_{appid}.json) 조립.
 * 백엔드 계약: docs/migration/storefront/game/bundle-view.md
 */

/** 번들 상품(옵션) 정보. */
export interface BundleGoodsItem {
  product_code: number;
  product_name: string;
  product_name_en: string;
  goods_sku: string;
  domain: string;
  /** '1' steam | '34' epic | '35' rockstar */
  product_platform: string;
  /** 'edition' | 'game_bundle' | 'dlc_bundle' | 'etc_bundle' 등 */
  display_type: string;
  /** 'Y' | 'N' */
  is_preorder: string;
  is_bonus: string;
  soldout: string;
  consumer_price: number;
  price: number;
  discount: number;
  promotion: { sale_price: number; discount_rate: number; promotion_end: string };
  coming_soon: string;
  coming_soon_date: string;
  release_date: string;
  /** goods_item.developer 우선, 없으면 백엔드가 package steam JSON developers 조립 */
  developer: string;
  publisher: string;
  /** 'Y' | 'N' — 세션 위시(비로그인 N) */
  wishlist_chk: string;
}

/** 번들 구성 상품(steam JSON 해소). */
export interface BundlePackageItem {
  header_image: string;
  item_name: string;
  short_description: string;
  /** 없으면 빈 문자열 */
  release_date: string;
}

export interface BundleDetailResponse {
  /** 'Y' | 'N' */
  goods_status: string;
  goods_status_msg: string;
  goods_item: BundleGoodsItem;
  /** getPlatform(product_platform) — 모바일 상품고시 이용조건 링크(모바일 이관 증분). */
  platform_name?: string;
  region_msg: string;
  /** 'Y' | 'N' — display_type in edition/dlc_bundle/game_bundle && description 존재 */
  show_description: string;
  /** Parsedown(## 치환) 결과 HTML */
  description_html: string;
  /** 'Y' | 'N' — display_type in game_bundle/dlc_bundle/etc_bundle && package>0 */
  show_bundle_items: string;
  package_items: BundlePackageItem[];
  /** 연령등급(package ratings.kgrb 최대) — "10"|"18"|"15"|"" 등 */
  max_rating: string;
}
