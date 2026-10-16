import type { SearchRecommendation } from "@entities/search-recommendation";

/**
 * 개발용 fixture — 백엔드(`GET /api/search/recommendations`) 준비 전 SSR 주입에 사용.
 * legacy `tbl_search_recommand` 응답 형태(노출 슬롯 최대 4) 재현.
 * 실제 운영값은 백엔드 연결 시 대체된다.
 */
export const searchRecommendationsFixture: SearchRecommendation[] = [
  { idx: 1, keyword: "발더스 게이트 3", link_url: "" },
  { idx: 2, keyword: "몬스터 헌터 와일즈", link_url: "" },
  { idx: 3, keyword: "엘든 링", link_url: "" },
  { idx: 4, keyword: "사이버펑크 2077", link_url: "" },
];
