/**
 * 메인 배너 (legacy `tbl_main_banner` + 상품 조인).
 * 백엔드 계약: `GET /api/main/banners` — docs/migration/storefront/main/main-banner-notice.md
 * 필드는 legacy 응답 계약을 그대로 반영해 snake_case를 유지한다.
 */
export interface MainBannerTitleInfo {
  publisher: string;
  sku?: string;
}

export interface MainBannerPromotion {
  sale_price: number;
}

export interface MainBannerOptionInfo {
  product_name: string;
  consumer_price: number;
  price: number;
  /** 'Y' | 'N' */
  is_preorder: string;
  /** 'Y' | 'N' — 특전 여부(모바일 main_banner 특전 badge). legacy option_info.is_bonus */
  is_bonus?: string;
  release_date: string;
  promotion?: MainBannerPromotion;
}

export interface MainBanner {
  main_banner_pc: string;
  main_banner_mobile: string;
  main_banner_publisher: string;
  main_banner_link: string;
  main_banner_target: string;
  main_banner_type: string;
  banner_title: string;
  /** 'Y' | 'N' — 상품정보(판매상태/상품명) 노출 여부 */
  show_prod_info: string;
  /** 'Y' | 'N' — 판매정보(퍼블리셔/가격/출시일) 노출 여부 */
  show_sale_info: string;
  /** product_code>0인 배너에만 존재 */
  title_info?: MainBannerTitleInfo;
  /** product_code>0인 배너에만 존재 */
  option_info?: MainBannerOptionInfo;
}
