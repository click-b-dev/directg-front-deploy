# 통계 영역 기반 + 일별 주문집계 (#228)

> 통계·리포팅(statistics) 영역 착수 단위. china #218 선례처럼 **영역 기반(사이드바 전환) + 진입 화면(일별 주문집계)** 을 한 단위로 묶는다.

## 원본
- 사이드바: `pc/_Admin_/inc/sidebar_statistics.php`
- 진입 화면: `pc/_Admin_/statistics/order/order_day_count.php` (topbar `statistics` 진입점, `menu.ts` href=`/statistics/order/order_day_count`)
- 집계 처리기: `pc/_Admin_/statistics/order/order_count_batch.php` (AJAX POST 대상)
- 참조 문서: `../legacy-project/docs/STATISTICS-REPORTING.md`, `docs/legacy-admin/60-statistics.md`

## 영역 정찰 — 사이드바 라이브 메뉴 전수

`sidebar_statistics.php` 기준. 대시보드 link **없음**. 모든 그룹 `<div class="collapse">`(초기 접힘, `show` 없음) → **order 선례처럼 아코디언(expandAll=false)**.

| 그룹 | 라벨 | 링크(라이브) |
|------|------|--------------|
| 상품 분석 (sidebarGoods) | 인기타이틀 순위 | `/statistics/goods/title_ranking` |
| | Metacritic Score | `/statistics/goods/metacritic_score` |
| 주문 분석 (sidebarOrder) | 일별 주문집계 | `/statistics/order/order_day_count` ← **진입** |
| | 월별 주문집계 | `/statistics/order/order_month_count` |
| | 대표상품별 주문통계 | `/statistics/order/order_title_count` |
| | 옵션상품별 주문통계 | `/statistics/order/order_goods_count` |
| | 공급처 주문통계 | `/statistics/order/order_publisher_count` |
| | 공급처 - 옵션상품 통계 | `/statistics/order/order_goods_publisher_count` |
| | 기간별 주문통계 | `/statistics/order/sales_goods_day` |
| Asset 주문 분석 | Asset 일별 주문현황 | `/statistics/order/order_asset_day_count` |
| | Asset 월별 주문현황 | `/statistics/order/order_asset_month_count` |
| Ztorm 주문 분석 | Ztorm 일별/월별 주문현황 | `order_ztorm_day_count` / `order_ztorm_month_count` |
| Genba 주문 분석 | Genba 일별/월별/퍼블리셔/누적 | `order_genba_day_count` / `order_genba_month_count` / `genba_publisher_count` / `genba_total_count` |
| Vaultn 주문 분석 | Vaultn 일별/월별/누적/월별(비교용) | `order_vaultn_day_count` / `order_vaultn_month_count` / `vaultn_total_count` / `order_vaultn_month_count_compare` |
| 홀로 모델 주문 분석 | 홀로 모델 월별 주문현황 | `/statistics/order/order_holomodels_count` |
| 결제 분석 (sidebarSales) | 일별/월별/PG별 | `sales/sales_day` / `sales/sales_month` / `sales/sales_pg` |
| | **[X] 결제수단별 결제현황** | `sales/sales_settlekind` — **파일 부재(죽은 링크)** |
| | **[X] 포인트 적립/사용 현황** | `sales/sales_emoney` — **파일 부재(죽은 링크)** |
| 할인 프로모션 분석 (sidebarPromotion) | 할인 프로모션 주문통계 | `/statistics/promotion/promotion_report` |

**주석 처리(미노출, 범위 밖)**: 회원 분석 그룹 전체 · 상품 분석 내 공급처별/예약판매/장바구니/위시리스트 · 주문 분석 내 실물상품별/누적판매순위 · Asset 퍼블리셔/누적 · Ztorm 누적 · 제휴DG 분석 그룹 · 프로모션 분석(별도) 그룹 · 랜덤박스 통계 그룹.

**[X] 죽은 링크 이식 방침**: goods `[X] Randombox 목록`·promotion `[X] 타임딜` 선례처럼 라벨(`[X]`)+href 유지, 라우트 미생성(죽은 링크). `sales_settlekind.php`/`sales_emoney.php`는 legacy `statistics/sales/`에 실제 파일 부재.

**orphan(사이드바 미도달, 범위 밖)**: `statistics/event/event_order_count.php`(사이드바 링크 없음), `statistics/sales/sales_title.php`(주석 링크), `randombox_*`·`order_retail_count`·`goods_ranking` 등.

## 화면·플로우 (order_day_count.php)

- **진입 URL**: `/statistics/order/order_day_count?search_year=YYYY&search_month=MM`
- **GET 파라미터**: `search_year`(기본 `date('Y')`), `search_month`(기본 `date('m')`, 2자리)
- **page_title**: "일별 주문현황" (사이드바 라벨 "일별 주문집계"와 상이 — 원문 유지)
- **breadcrumb**: 홈 / 통계 / 주문분석 / 일별 주문현황
- **검색폼**(GET): 주문날짜 = 연도 select(`:::년도:::` + 2013~현재년) + 월 select(`:::월:::` + 01~12) + `검색` 버튼. `class="row row-cols-lg-auto g-3 align-items-center mb-3"`.
- **테이블**(`table table-centered w-100 dt-responsive nowrap table-bordered table-sm`, thead `table-light font-13`, tbody `font-12`, tfoot `table-light`):
  - 2행 헤더: `날짜`(rowspan2) / `예약 판매`(colspan3) / `일반 판매`(colspan3) / `프로모션 판매`(colspan3) / `합계`(colspan2) / `집계`(rowspan2). 2행: 각 판매유형 `주문건수 / 주문합계 / 건수별 비율(금액별 비율)`, 합계 `주문건수 / 주문합계`.
  - 본문: 해당 월 1일~말일(`date('t')`)까지 **모든 날짜 행** 생성. 데이터 없는 날은 0(number_format).
  - 각 날짜 행: 날짜 / 예약(건수·합계·비율) / 일반(건수·합계·비율) / 프로모션(건수·합계·비율) / 합계(건수·합계) / 집계셀.
  - **비율 계산(프론트)**: 건수비율 = `total_count>0 ? round(유형_count*100/total_count, 2) : ""` + `%`, 금액비율 = `total_price>0 ? round(유형_price*100/total_price,2) : ""` + `%`(괄호). legacy `round(...,2)` 그대로.
  - **집계셀**: `batch_date` + 줄바꿈 + `집계` 버튼(`btn btn-outline-secondary btn-sm`, data-date=`YYYY-MM-DD`, data-year). 조건문 주석처리 → **항상 노출**.
  - tfoot 합계: 월 전체 합. 예약 비율셀은 **빈칸**(legacy `<th class="text-end"></td>` 태그 불일치·의도적 공란). 일반 비율 = `normal/total`, 프로모션 비율 = `promotion/total`. **프로모션 금액비율 앞 `((` 이중 괄호 오타** 이식.
- **집계 버튼 동작**: jQuery click → `$.ajax POST order_count_batch.php {mode:"batch_day", search_year, ord_ymd}` → success `location.reload()`. 에러 시 `alert(data)`.
- **세션/권한**: `lib.php` include(admin 세션 가드). 프론트는 route-guard(#2) 소관.
- **AJAX**: 집계 버튼만(`order_count_batch.php`).

## 데이터 (legacy)

- **DB**: `$dsn`(MAIN DB) 직접 PDO. 도메인 클래스 미경유(inline SQL).
- **Query1**(집계 원천, 선계산 테이블 `tbl_sales`):
  ```sql
  select ord_ymd, is_preorder, is_promotion,
         sum(sales_count) as total_count,
         sum(sales_count*unit_price) as total_price
  from tbl_sales
  where ord_ymd between :start_date and :end_date
  group by ord_ymd, is_preorder, is_promotion
  ```
  분류: `is_preorder='Y'` → preorder / else `is_promotion='Y'` → promotion / else → normal. 일자별 preorder/normal/promotion + 합계 누적.
- **Query2**(배치 로그): `select ord_ymd, batch_date from tbl_sales_log where ord_ymd between :start and :end order by ord_ymd asc` → 일자별 `batch_date`.
- `tbl_sales`는 **선계산 배치 결과 테이블**(실시간 아님). 집계 버튼이 `order_count_batch.php`로 특정 일자를 재집계(step='2' AND status='2' 조건, 연도별 파티션 `tbl_order_{year}`/`tbl_order_item_{year}` 분기)해 `tbl_sales` upsert. → **백엔드 책임**.

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/day-count`
- 요청: `search_year`(YYYY), `search_month`(MM, 2자리). 미지정 시 서버 당월 기본이 아니라 **프론트에서 기본값 주입 후 항상 전달**(china 선례).
- 응답:
  ```ts
  type StatOrderDaySalesBucket = { total_count: number; total_price: number };
  type StatOrderDayItem = {
    ord_ymd: string;              // "YYYY-MM-DD"
    preorder: StatOrderDaySalesBucket;
    normal: StatOrderDaySalesBucket;
    promotion: StatOrderDaySalesBucket;
    total_count: number;
    total_price: number;
    batch_date: string;          // tbl_sales_log.batch_date, 없으면 ""
  };
  type StatOrderDayCountResponse = {
    search_year: string;
    search_month: string;
    days: StatOrderDayItem[];    // sparse: tbl_sales/tbl_sales_log에 존재하는 일자만. 없는 날은 프론트가 0으로 채움
  };
  ```
- 백엔드 책임: Query1(tbl_sales group by) + Query2(tbl_sales_log) 병합. `days`는 sales 또는 batch_date가 있는 일자만 포함(sparse). **비율은 프론트 계산**.

### `POST /admin/statistics/order/day-count/batch`
- legacy `order_count_batch.php` mode=`batch_day`.
- 요청: `{ search_year: string; ord_ymd: string }`.
- 응답: `{ success: boolean }`(legacy는 응답 본문 미사용, success 시 reload).
- 백엔드 책임: `search_year` 분기(2013~2020 아카이브 `tbl_order_{year}`/`tbl_order_item_{year}` DGKR DB, 최근 통합 `tbl_order`/`tbl_order_item`) → `step='2' AND status='2'` 집계 → `tbl_sales`/`tbl_sales_log` upsert. 프론트는 성공 시 day-count 재조회(invalidate).

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/order/order_day_count.tsx` → `/statistics/order/order_day_count`
- 스크린: `screens/statistics-order-day-count`
- 엔티티(신규 슬라이스): `entities/statistics` — `fetchStatisticsOrderDayCount`/`useStatisticsOrderDayCount` + `runOrderDayBatch`/`useOrderDayBatch`
- 사이드바: `widgets/sidebar/model/nav.ts` — `STATISTICS_SIDE_NAV`(9그룹, 대시보드 없음, expandAll=false) + `resolveSideNav` `/statistics` 분기
- mock: `shared/mocks/handlers/statistics.ts`(신규) + `handlers.ts` 등록

## Parity 체크리스트
- [ ] 사이드바 9그룹·라벨·링크·[X] 죽은 링크·아코디언(active만 펼침) 일치
- [ ] 검색폼(연도 2013~현재·월 01~12·기본 당월) 일치, GET 제출
- [ ] 2행 헤더 rowspan/colspan·클래스 일치
- [ ] 월 전일 행 생성(데이터 없는 날 0)·비율 계산(round 2·>0 가드·빈문자)·집계셀 batch_date+버튼 일치
- [ ] tfoot 합계·예약 비율 빈칸·프로모션 금액비율 `((` 오타 이식
- [ ] 집계 버튼 → batch mutation → 성공 시 재조회
- [ ] page_title "일별 주문현황"(사이드바 "일별 주문집계"와 상이) 유지
