/**
 * 주말특가 프로모션 설정 (legacy `Promotion::getPromotionWeekend`).
 * 계약: `GET /api/promotion/weekend/config`. 기간 접근제한/배너.
 * 문서: docs/migration/storefront/promotion/promotion-weekend.md
 */
export interface PromotionWeekendConfig {
  /** promotion_week_name — 배너 title/alt. */
  name: string;
  /** promotion_week_banner_link — 배너 링크. */
  bannerLink: string;
  /** promotion_week_start (Y-m-d H:i:s). */
  weekStart: string;
  /** promotion_week_end (Y-m-d H:i:s). */
  weekEnd: string;
  /** 현재 주말특가 기간 여부(서버시간 금16~월16). 백엔드 판정. */
  isActive: boolean;
  /** 미리보기 허용(관리자 IP 등) — isActive=false여도 alert만(redirect 없음). */
  allowView: boolean;
}
