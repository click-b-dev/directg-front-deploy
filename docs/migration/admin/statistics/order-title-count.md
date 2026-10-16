# 대표상품별 주문통계 (#230)

> 통계 주문 분석 그룹 3번째. 기간(연/월)별 대표상품(title) 단위 판매 집계. 상품유형(기본게임/에디션/DLC) 컬럼 분할 + 인기 타이틀 저장 mutation.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_title_count.php` + `title_order_ps.php`(best_game_save)
- 도메인: `Admin::getTitleSalesCount`(3201), `Admin::getTitleName`(383), `Admin::getGoodsSalesCount`/`getGameTitleSearch`/`getDLCTitleSearch`/`getEditionTitleSearch`(best-save)
- 참조: `docs/legacy-admin/60-statistics.md`, #228/#229

## 화면·플로우
- **진입 URL**: `/statistics/order/order_title_count?search_year=YYYY&search_month=MM`
- **GET 파라미터**: `search_year`(기본 `date('Y')`), `search_month`(선택, 미지정 시 연 전체).
- **page_title**: "대표상품별 주문현황" · breadcrumb: 홈 / 통계 / 주문분석 / 대표상품별 주문현황
- **기간 산출**(백엔드 위임): search_month 없음 → `{year}-01-01` ~ `{year}-12-31`(연 전체). search_month 있음 → `{year}-{month}-01` ~ `{year}-{month}-{말일}`. (코드 58~67 `$search_year==""` 분기는 15행 기본값으로 dead)
- **검색필터 카드**(`card-header bg-secondary text-white` "검색필터", form-horizontal):
  - 주문기간: 연도 select(`:::년:::` + 2013~현재) + 월 select(`:::월:::` + 01~12), input-group + `검 색` 버튼.
  - **인기 타이틀 저장** 버튼(`btn btn-info` `#btn_best_save`, 우측 정렬).
- **테이블**(`table table-bordered table-centered table-sm`, thead `table-light font-13`):
  - 2행 헤더: 순위(rowspan2,50px) / 대표상품코드(rowspan2,100px) / 대표상품명(rowspan2) / 기본게임(colspan2) / 에디션(colspan2) / DLC(colspan2) / 합계(colspan2). 2행: 각 그룹 수량·금액(40px).
  - 본문: title 목록(백엔드 정렬 순서), `ranking = index+1`, title_id 있는 행만. 11셀: 순위 / 대표상품코드(title_id) / 대표상품명(`px-1`) / game 수량·금액 / edition 수량·금액 / dlc 수량·금액 / 합계 수량(sales_count)·금액(sales_price). 숫자는 `<span class="num">number_format()</span>`.
  - **tfoot**(`table-dark`): `{search_year}년 {search_month} 합계`(colspan3) + game 총수량·총금액 / edition 총수량·총금액 / **dlc 총수량·총금액(span.num 없음 quirk)** / 총합수량·총합금액. 각 title의 game/edition/dlc 누적 합.
- **인기 타이틀 저장 동작**: click → `$.ajax POST title_order_ps.php {mode:"best_game_save", search_year, search_month}` → success `alert("집계가 완료되었습니다.")`. **reload 없음(주석)** → invalidate 없음.
- **AJAX/세션**: best-save 1종. `lib.php` admin 가드(route-guard #2 소관).

### legacy dead/quirk
- 43~52·136~151행 주석(getTitleListAll 초기화·bundle 분기) 미이식.
- 26~28행 `$page` 분기 dead(페이지네이션 없음).
- tfoot dlc 2셀만 `span.num` 미래핑(game/edition/합계는 래핑) — 이식.
- 본문 stray `</td>`(327행)·중복 스타일 등 무해 마크업 정리.

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO. `Admin`·`AdminGoods` 클래스.
- **getTitleSalesCount($start,$end)** (Admin.php:3201):
  ```sql
  select b.title_id, b.product_type,
         sum(t.sales_count) as total_count,
         sum(t.sales_count*t.unit_price) as total_price
  from (select product_code, product_name, sales_count, unit_price
        from tbl_sales where ord_ymd between :start_date and :end_date) as t
  inner join tbl_title_option b on t.product_code = b.product_code
  group by b.title_id, b.product_code, b.product_type
  ```
  → 반환 행: title_id, product_type(game/edition/dlc/…), total_count, total_price.
- PHP 후처리: product_type별(game/edition/dlc, **bundle 주석**)로 title_id 단위 누적 → 각 title의 game/edition/dlc 버킷 + sales_count/sales_price(3종 합). title_name은 `getTitleName(title_id)`. 정렬 `array_multisort(sales_price DESC, sales_count DESC)`.
- **best_game_save**(title_order_ps.php): `getGoodsSalesCount` + 상품유형별 title 검색 → `tbl_sales_ranking` upsert + `tbl_best_title_config` batch_date 갱신. → **백엔드 책임**.

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/title-count`
- 요청: `search_year`(YYYY), `search_month`(MM, 빈 문자열 허용=연 전체). 프론트 기본값(당년) 주입.
- 응답:
  ```ts
  type StatOrderTitleItem = {
    title_id: string;
    title_name: string;
    game: StatOrderDaySalesBucket;      // { total_count, total_price }
    edition: StatOrderDaySalesBucket;
    dlc: StatOrderDaySalesBucket;
    sales_count: number;                // game+edition+dlc 수량
    sales_price: number;                // game+edition+dlc 금액
  };
  type StatOrderTitleCountResponse = {
    search_year: string;
    search_month: string;
    titles: StatOrderTitleItem[];       // 백엔드 정렬: sales_price DESC, sales_count DESC
  };
  ```
- 백엔드 책임: 기간 산출(month 유무 분기) + getTitleSalesCount group by + product_type 병합 + title_name + array_multisort. **합계는 프론트 계산**.

### `POST /admin/statistics/order/title-count/best-save`
- legacy `title_order_ps.php` mode=`best_game_save`.
- 요청: `{ search_year: string; search_month: string }`.
- 응답: `{ success: boolean }`(legacy 본문 미사용, success 시 alert만·reload 없음).
- 백엔드 책임: 기간 집계 → `tbl_sales_ranking`/`tbl_best_title_config` upsert. 프론트는 성공 시 `alert("집계가 완료되었습니다.")`·**invalidate 없음**.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_title_count.tsx` → `/statistics/order/order_title_count`
- 스크린: `screens/statistics-order-title-count`
- 엔티티: `entities/statistics` 확장(title-count fetch/query + best-save mutation)
- mock: `handlers/statistics.ts` 확장(GET title-count + POST best-save)

## Parity 체크리스트
- [ ] 검색필터(연도+월 select·기본 당년·월 미지정 연전체)·인기 타이틀 저장 버튼
- [ ] 2행 헤더(순위/코드/상품명 + 기본게임/에디션/DLC/합계 각 수량·금액)·font-13
- [ ] 본문 정렬(sales_price DESC, sales_count DESC)·ranking·span.num
- [ ] tfoot table-dark·`{year}년 {month} 합계`·dlc span.num 없음 quirk
- [ ] 인기 타이틀 저장 → best-save → alert만(reload 없음)
- [ ] page_title "대표상품별 주문현황"
