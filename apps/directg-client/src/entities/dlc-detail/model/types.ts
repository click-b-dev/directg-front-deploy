/**
 * DLC 상세 (legacy `pc/game/dlc_view.html`) 응답 타입.
 * 백엔드가 Goods/Mypage2 조립 — snake_case verbatim.
 * 백엔드 계약: docs/migration/storefront/game/dlc-view.md
 */
import type { MediaItem } from "@shared/types/product-detail";

export type { MediaItem };

/** DLC 옵션 정보(embedded promotion). */
export interface DlcInfo {
  product_code: number;
  product_name: string;
  product_name_en: string;
  goods_sku: string;
  domain: string;
  /** '1' steam | '34' epic | '35' rockstar */
  product_platform: string;
  /** 'Y' | 'N' */
  is_bonus: string;
  is_preorder: string;
  soldout: string;
  consumer_price: number;
  price: number;
  discount: number;
  /** getGoodsItemDetailSku embedded 프로모션 */
  promotion: { sale_price: number; discount_rate: number; promotion_end: string };
  release_date: string;
  spoken_korean: string;
  interface_korean: string;
  exclusive_korean: string;
  /** 'Y' | 'N' — 세션 위시(비로그인 N) */
  wishlist_chk: string;
}

/** 부모 게임 타이틀(getTitleDetail). */
export interface DlcTitleInfo {
  product_id: string;
  title_name: string;
  developer: string;
  publisher: string;
  age_limit: string;
  game_rate: string;
}

export interface DlcDetailResponse {
  /** 'Y' | 'N' */
  goods_status: string;
  goods_status_msg: string;
  /** getPlatform(product_platform) — "플레이하려면 [platform]버전" */
  platform_name: string;
  /** 'Y' | 'N' — is_preorder && release_date>=now && delivery_date>=now */
  is_preorder_notice: string;
  dlc_info: DlcInfo;
  title_info: DlcTitleInfo;
  goods_description: { short_description: string; region_msg: string };
  /** version==2 ? description_v2 raw : Parsedown(## 치환) */
  description_html: string;
  legal_html: string;
  steam_info: { drm_notice: string; ext_user_account_notice: string };
  /** 스크린샷 병합(유튜브 없음) */
  media_list: MediaItem[];
  /** 구성정보 상세 */
  package_info: { unit_name: string }[];
  genre_names: string[];
  category_names: string[];
}
