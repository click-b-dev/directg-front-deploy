/**
 * 액세서리/실물 상품 상세 (legacy `pc/game/goods_item_view.html`) 응답 타입.
 * 백엔드가 getTitleInfoSku + getGoodsItemDetailSku + getAttributeInfo + getGoodsItemDeliveryList
 * + steam JSON(관련상품) 조립. 백엔드 계약: docs/migration/storefront/game/goods-item-view.md
 */
import type { MediaItem } from "@shared/types/product-detail";

export type { MediaItem };

/** 옵션 상품. */
export interface GoodsOptionItem {
  product_code: number;
  product_name: string;
  product_name_en: string;
  goods_sku: string;
  domain: string;
  soldout: string;
  consumer_price: number;
  price: number;
  discount: number;
  promotion: { sale_price: number; discount_rate: number; promotion_end: string };
  /** '1' 코드 | '2' 택배 | '3' 코드+택배 */
  delivery_type: string;
  steam_appid: number;
  /** 'Y' | 'N' — 세션 위시(비로그인 N) */
  wishlist_chk: string;
}

/** 대표상품(타이틀) 최소 정보. */
export interface GoodsItemTitleInfo {
  title_id: string;
  title_name: string;
  age_limit: string;
  game_rate: string;
  spoken_korean: string;
  interface_korean: string;
}

/** 상품 정보 제공 고시(getAttributeInfo). */
export interface GoodsAttributeInfo {
  delivery_method_info: string;
  as_information2: string;
  product_name: string;
  model_name: string;
  kc_safety_infomartion: string;
  rated_voltage: string;
  power: string;
  manufacturing_date: string;
  manufacturer: string;
  manufacture_country: string;
  size: string;
  weight: string;
  main_requirements: string;
  warranty_service: string;
  as_information: string;
}

/** 관련상품 게임정보(steam JSON 해소, delivery_type==3 && steam_appid>0). */
export interface SteamGameInfo {
  game_name: string;
  /** date("Y년 m월 d일", +1day) 최종 문자열 */
  release_date: string;
  /** implode(",") 문자열 */
  developer: string;
  publisher: string;
  /** genres[].description */
  genres: string[];
  /** categories[].description */
  categories: string[];
}

export interface GoodsItemDetailResponse {
  /** 'Y' | 'N' */
  goods_status: string;
  goods_status_msg: string;
  option_item: GoodsOptionItem;
  title_info: GoodsItemTitleInfo;
  media_list: MediaItem[];
  attribute_info: GoodsAttributeInfo;
  /** is_package_view ? 구성상품 설명 : 옵션 설명 (Parsedown, 백엔드 렌더) */
  description_html: string;
  /** 'Y' | 'N' — delivery_type==3 && steam_appid>0 */
  show_game_info: string;
  steam_game_info: SteamGameInfo | null;
}
