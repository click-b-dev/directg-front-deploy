/**
 * 활성 그룹 프로모션 (legacy `tbl_group`).
 * 백엔드 계약: `GET /api/promotion/groups` — docs/migration/storefront/layout/common-layout.md
 * 필드는 백엔드 응답 계약을 그대로 반영해 snake_case를 유지한다.
 */
export interface PromotionGroup {
  idx: number;
  subject: string;
  /** unix timestamp(초) */
  start_date: number;
  /** unix timestamp(초) */
  end_date: number;
}
