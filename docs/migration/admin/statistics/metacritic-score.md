# Metacritic Score (#236)

> 통계 상품 분석 그룹 마지막. Steam 앱의 Metacritic 점수 순위(출시연도 필터·100/page). 읽기전용.

## 원본
- 파일: `pc/_Admin_/statistics/goods/metacritic_score.php`
- 도메인: `AdminGoods::getGoodsMetacriticScore`(pagination, 100/page)
- 참조: `docs/legacy-admin/60-statistics.md`

## 화면·플로우
- **진입 URL**: `/statistics/goods/metacritic_score?search_year=&page=`
- **GET 파라미터**: `search_year`(출시연도, 선택), `page`(기본 1).
- **page_title**: "Metacritic Score" · breadcrumb: 홈 / 통계 / 상품분석 / Metacritic Score
- **검색필터 카드**("대표상품 검색필터"): 출시연도 select(`::선택::` + 2005~현재) + `검색`.
- **"{total_results} 개"** 텍스트(필터 아래).
- **테이블**(`table table-bordered table-centered w-100 table-sm`, thead **table-dark** font-13): 9컬럼 — 순위/Steam APP ID(appid)/name/App Type(app_type)/퍼블리셔(publisher)/출시일(release_date)/스팀 평가수(recommendations number_format)/Metacritic Score(metacritic_score raw)/Metacritic URL(바로가기 `<a target=_blank btn btn-outline-secondary btn-sm>`).
  - 순위 = `ranking + 100*(page-1)`(1-based). 100/page.
- **페이지네이션**: `links_html`(100/page) → `shared/ui/ServerPagination`.
- **세션/권한**: `lib.php` admin 가드.
- **mutation/AJAX**: 없음(읽기전용).

### legacy dead/quirk
- `is_view<>'D'`·publisher_data 주석. metacritic_url은 raw href(외부 링크, 미이관 대상 아님 — 실제 metacritic.com URL).

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO.
- **getGoodsMetacriticScore**(AdminGoods, 100/page):
  ```sql
  select a.metacritic_score, a.metacritic_url, a.name, a.release_date, a.appid,
         a.recommendations, a.publisher, a.app_type
  from steam_app_list a
  where a.app_type<>'Music' and a.metacritic_score>0 [+ date_format(a.release_date,'%Y')=:year]
  order by a.metacritic_score desc, a.release_date desc
  ```

## API 계약 (백엔드 전달)

### `GET /admin/statistics/goods/metacritic-score`
- 요청: `search_year`(빈값 허용), `page`(기본 1).
- 응답:
  ```ts
  type StatMetacriticRow = {
    appid: string;
    name: string;
    app_type: string;
    publisher: string;
    release_date: string;
    recommendations: number;
    metacritic_score: number;  // raw 표시
    metacritic_url: string;
  };
  type StatMetacriticScoreResponse = {
    search_year: string;
    items: StatMetacriticRow[];
    pagination: { current_page: number; total_pages: number; total_results: number };
  };
  ```
- 백엔드 책임: steam_app_list(app_type≠Music·score>0·연도필터) score desc·release desc, 100/page.

## 타겟 매핑
- 라우트: `routes/statistics/goods/metacritic_score.tsx` → `/statistics/goods/metacritic_score`
- 스크린: `screens/statistics-metacritic-score`
- 엔티티: `entities/statistics` 확장(metacritic-score)
- mock: `handlers/statistics.ts` 확장(GET metacritic-score)
- 공용: `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] 검색필터(출시연도 2005~현재 선택적)·"{total} 개"
- [ ] 9컬럼 table-dark·순위 오프셋(100/page)·recommendations 포맷·Metacritic URL 바로가기(target _blank)
- [ ] ServerPagination(100/page)·페이지 파라미터 유지
- [ ] 읽기전용·page_title "Metacritic Score"
