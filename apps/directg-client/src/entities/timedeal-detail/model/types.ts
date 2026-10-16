/**
 * 타임딜 상세 (legacy `pc/game/timedeal_view.html`) 응답 타입.
 * 백엔드가 getGoodsItemDetailSku + getTimedealSchedule + getSteamAppInfo + getTitleDetail 조립.
 * 백엔드 계약: docs/migration/storefront/game/timedeal-view.md
 */

export interface TimedealInfo {
  product_code: number;
  product_name: string;
  product_name_en: string;
  goods_sku: string;
  /** '1' steam | '34' epic | '35' rockstar */
  product_platform: string;
  soldout: string;
  consumer_price: number;
  age_limit: string;
  game_rate: string;
  spoken_korean: string;
  interface_korean: string;
  release_date: string;
}

export interface TimedealDetailResponse {
  /** 'Y' | 'N' */
  goods_status: string;
  goods_status_msg: string;
  timedeal_info: TimedealInfo;
  /** getTimedealSchedule — 타임딜가 */
  timedeal_schedule: { timedeal_price: number };
  /** OG url용 title sku(getTitleDetail) */
  title_info: { sku: string };
  /** getSteamAppInfo */
  steam_info: {
    developer: string;
    publisher: string;
    drm_notice: string;
    ext_user_account_notice: string;
  };
  goods_description: { short_description: string };
  /** Parsedown(## 치환) */
  description_html: string;
  requirements_html: string;
  legal_html: string;
  genre_names: string[];
  category_names: string[];
}
