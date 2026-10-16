# 인기타이틀 순위 (#235)

> 통계 상품 분석 그룹 1번째. #230 인기타이틀 집계 저장(`tbl_sales_ranking`)의 **읽기 뷰**(연/월 필터·50/page 서버 페이지네이션) + 집계 저장 버튼(reload).

## 원본
- 파일: `pc/_Admin_/statistics/goods/title_ranking.php` + `title_order_ps.php`(best_game_save, #230 재사용)
- 도메인: `Admin::getTitleRanking`(3229, pagination)
- 참조: `docs/legacy-admin/60-statistics.md`, #230

## 화면·플로우
- **진입 URL**: `/statistics/goods/title_ranking?search_year=&search_month=&page=`
- **GET 파라미터**: `search_year`(선택, 미지정=전체), `search_month`(선택, 미지정=전체), `page`(기본 1). (legacy 기본값 주석처리 → 미지정 시 필터 없음=전체 랭킹)
- **page_title**: "인기타이틀 순위" · breadcrumb: 홈 / 통계 / 상품 분석 / 인기타이틀 순위
- **검색필터 카드**: 주문기간 = 연도 select(`:::년:::`+2013~현재) + 월 select(`:::월:::`+01~12) + `검 색`. (둘 다 선택적)
- **인기타이틀 집계 저장** 버튼(`btn_best_save`, 필터 카드와 표 **사이**의 독립 버튼) → best_game_save → **alert + reload**(#230과 달리 reload 실행 = 랭킹 invalidate).
- **테이블**(`table table-bordered table-centered table-sm`, thead `table-light font-13`): 11컬럼 — 순위/대표상품코드/대표상품명/퍼블리셔/출시일/Game 주문수량/Game 주문금액/DLC 주문수량/DLC 주문금액/합계 주문수량/합계 주문금액. 숫자 `<span class="num">`. tfoot 없음.
  - 순위 = `(page-1)*50 + rankingInPage`.
  - Game 컬럼 = total_count/total_price(tbl_sales_ranking, game+edition), DLC = dlc_count/dlc_price. 합계 = Game+DLC.
  - 퍼블리셔·출시일 = tbl_goods raw(폴백 없음).
- **페이지네이션**: `links_html`(pagination 클래스, 50/page) → `shared/ui/ServerPagination`.
- **세션/권한**: `lib.php` admin 가드.
- **AJAX**: best_game_save 1종(reload).

### legacy dead/quirk
- 20~28행 기본값 주석 → 연/월 미지정 시 전체.
- `$param`(page 제외 GET 재조립) = 페이지네이션 링크 파라미터 유지.

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO.
- **getTitleRanking**(Admin.php:3229, 50/page):
  ```sql
  select sum(a.total_count) as total_count, sum(a.total_price) as total_price,
         sum(a.dlc_count) as dlc_count, sum(ifnull(a.dlc_price,'0')) as dlc_price, b.*
  from tbl_sales_ranking a inner join tbl_goods b on a.title_id=b.title_id
  where b.title_id is not null [+ a.sales_year=:year] [+ a.sales_month=:month]
  group by a.title_id order by sum(total_price+ifnull(a.dlc_price,'0')) desc
  ```
  → title별 total_count/price + dlc_count/price + tbl_goods(title_id/title_name/publisher/release_date). 정렬 (총금액+dlc금액) desc.
- **best_game_save**(title_order_ps.php): #230 계약과 동일(tbl_sales_ranking upsert). → **백엔드 책임**.

## API 계약 (백엔드 전달)

### `GET /admin/statistics/goods/title-ranking`
- 요청: `search_year`(빈값 허용), `search_month`(빈값 허용), `page`(기본 1).
- 응답:
  ```ts
  type StatTitleRankingRow = {
    title_id: string;
    title_name: string;
    publisher: string;   // tbl_goods raw
    release_date: string; // tbl_goods raw
    total_count: number; // Game(=game+edition) 수량
    total_price: number;
    dlc_count: number;
    dlc_price: number;
  };
  type StatTitleRankingResponse = {
    search_year: string;
    search_month: string;
    items: StatTitleRankingRow[];
    pagination: { current_page: number; total_pages: number; total_results: number };
  };
  ```
- 백엔드 책임: getTitleRanking(50/page, 연/월 필터, 정렬). 합계 컬럼은 프론트 계산(total+dlc).
- best-save: 기존 `POST /admin/statistics/order/title-count/best-save`(#230) 재사용. **#235는 성공 시 랭킹 invalidate**(reload).

## 타겟 매핑
- 라우트: `routes/statistics/goods/title_ranking.tsx` → `/statistics/goods/title_ranking`
- 스크린: `screens/statistics-title-ranking`
- 엔티티: `entities/statistics` 확장(title-ranking) + `useRunStatOrderTitleBestSave`(#230) 재사용
- mock: `handlers/statistics.ts` 확장(GET title-ranking)
- 공용: `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] 검색필터(연도+월 선택적)·집계 저장 버튼(필터·표 사이·reload)
- [ ] 11컬럼·순위 오프셋·Game/DLC/합계·num·퍼블리셔·출시일 raw
- [ ] 50/page ServerPagination·페이지 파라미터 유지
- [ ] 집계 저장 → best-save → alert + 랭킹 invalidate
- [ ] page_title "인기타이틀 순위"
