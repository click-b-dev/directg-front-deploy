/**
 * 게임 상세 (legacy `pc/game/game_view.html`) 응답 타입.
 * 백엔드가 도메인 메서드(Goods/Promotion/Mypage2)를 조립해 내려준다 — snake_case verbatim.
 * 백엔드 계약: docs/migration/storefront/game/game-view.md
 */

import type { GameOption, MediaItem, RecommandItem } from "@shared/types/product-detail";

export type { GameOption, MediaItem, RecommandItem };

/** 플랫폼별 옵션 묶음. */
export interface PlatformGoodsItem {
  game?: GameOption[];
  edition?: GameOption[];
  dlc?: GameOption[];
  dlc_bundle?: GameOption[];
}

/** 대표상품(타이틀) 정보. */
export interface TitleInfo {
  sku: string;
  title_id: string;
  title_name: string;
  title_name_en: string;
  domain: string;
  /** csv */
  genre: string;
  /** csv */
  category: string;
  publisher: string;
  developer: string;
  drm_notice: string;
  ext_user_account_notice: string;
  age_limit: string;
  game_rate: string;
  spoken_korean: string;
  interface_korean: string;
  exclusive_korean: string;
  coming_soon: string;
  coming_soon_date: string;
  release_date: string;
}

export interface GoodsDescription {
  short_description: string;
  /** 지역제한 등 안내(있으면 bg-danger alert) */
  region_msg: string;
}

export interface EventData {
  event_link_url: string;
  event_link_target: string;
  event_banner: string;
  subject: string;
  /** Parsedown 렌더 HTML(백엔드) */
  contents_html: string;
  event_notes_html: string;
}

/** legacy 안내 alert 판정 플래그(백엔드가 strpos 버그 포함해 동일 판정). */
export interface GameDetailFlags {
  is_early_access: string;
  is_free: string;
  only_multiplayer: string;
}

/** GA4 view_item 아이템. */
export interface Ga4Item {
  item_id: number;
  item_name: string;
  index: number;
  item_brand: string;
  item_category: string;
  item_category2: string;
  item_category3: string;
  item_category4: string;
  item_category5: string;
  item_list_id: string;
  item_list_name: string;
  price: number;
  discount: number;
  quantity: string;
}

export interface GameDetailResponse {
  /** 'Y' | 'N' — title_info.is_view */
  goods_status: string;
  goods_status_msg: string;
  /** 'Y' | 'N' */
  is_login: string;
  /** 확정된 현재 플랫폼 코드 */
  platform: string;
  /** getPlatform(platform) 해소명 — 상품 정보 제공 고시용 */
  platform_name: string;
  /** getTagName 해소된 장르명(title_info.genre 순서) */
  genre_names: string[];
  /** getTagName 해소된 카테고리명(title_info.category 순서) */
  category_names: string[];
  title_info: TitleInfo;
  goods_description: GoodsDescription;
  media_list: MediaItem[];
  title_platform: { product_platform: string }[];
  goods_item: Record<string, PlatformGoodsItem>;
  is_event_info: string;
  event_data: EventData | null;
  recommand_title: RecommandItem[];
  flags: GameDetailFlags;
  /** 게임설명 최종 HTML(dgkr + description, Parsedown/raw 규칙 백엔드) */
  description_html: string;
  /** Parsedown(requirements) */
  requirements_html: string;
  /** Parsedown(legal_text) */
  legal_html: string;
  ga4: Ga4Item[];
}
