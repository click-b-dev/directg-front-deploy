/**
 * 메인 공지 (legacy `tbl_notice`).
 * 백엔드 계약: `GET /api/main/notices` — docs/migration/storefront/main/main-banner-notice.md
 */
export interface Notice {
  idx: number;
  subject: string;
  notice_type: string;
  deploy_date: string;
}
