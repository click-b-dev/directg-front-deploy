/**
 * 추천 검색어 슬롯 (legacy `tbl_search_recommand`, 노출 최대 4).
 * 백엔드 계약: `GET /api/search/recommendations` — docs/migration/storefront/layout/common-layout.md
 * 필드는 백엔드 응답 계약을 그대로 반영해 snake_case를 유지한다.
 */
export interface SearchRecommendation {
  idx: number;
  keyword: string;
  /** legacy에서 header 렌더에는 미사용 (클릭 이동은 search_recommand_click.php?idx= 경유) */
  link_url: string;
}
