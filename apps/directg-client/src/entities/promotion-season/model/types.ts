/**
 * 시즌(대규모) 프로모션 설정 (legacy `Promotion::getPromotionSeason`).
 * 계약: `GET /api/promotion/season/config`. 기간 접근제한/배너/notice.
 * 문서: docs/migration/storefront/promotion/promotion-season.md
 */
export interface SeasonNotice {
  /** notice_view — "Y"면 notice 배너 노출. */
  view: string;
  title: string;
  btnUrl: string;
  btnTitle: string;
}

export interface PromotionSeasonConfig {
  /** promotion_season_name — page_title(동적). */
  name: string;
  /** promotion_season_banner_pc — "#"이면 배너 미노출. */
  bannerPc: string;
  /** promotion_season_banner_mobile — 모바일 배너 이미지. "#"이면 배너 미노출(모바일 전용, PC는 bannerPc 사용). */
  bannerMobile: string;
  /** promotion_season_banner_link. */
  bannerLink: string;
  /** promotion_season_start (Y-m-d H:i:s). */
  seasonStart: string;
  /** promotion_season_end (Y-m-d H:i:s). */
  seasonEnd: string;
  /** 현재 시즌 기간 여부(서버시간). 백엔드 판정. */
  isActive: boolean;
  /** 미리보기 허용(관리자 IP) — isActive=false여도 alert만. */
  allowView: boolean;
  notice: SeasonNotice;
}
