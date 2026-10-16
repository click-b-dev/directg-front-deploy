# 월별 주문집계 (#229)

> 통계 주문 분석 그룹 2번째. #228(일별) 자매 — 선택 **연도**의 12개월 집계. 읽기전용(집계 버튼·batch 없음).

## 원본
- 파일: `pc/_Admin_/statistics/order/order_month_count.php`
- 참조 문서: `docs/migration/admin/statistics/order-day-count.md`(#228), `docs/legacy-admin/60-statistics.md`

## 화면·플로우
- **진입 URL**: `/statistics/order/order_month_count?search_year=YYYY`
- **GET 파라미터**: `search_year`(기본 `date('Y')`). **`search_month` 없음**(폼에 월 select 없음, 코드 20행 `$selected['search_month']`는 dead).
- **page_title**: "월별 주문현황" · breadcrumb: 홈 / 통계 / 주문분석 / 월별 주문현황
- **검색폼**(GET): 주문날짜 = **연도 select만**(`:::년도:::` + 2013~현재년) + `검색`. (#228과 달리 월 select 없음)
- **테이블**(`table table-centered w-100 dt-responsive nowrap table-bordered table-sm`, thead `table-light` — **#228과 달리 font-13 없음**):
  - 2행 헤더: `날짜`(rowspan2) / `예약판매`(colspan2) / `일반판매`(colspan2) / `프로모션판매`(colspan2) / `합계`(colspan2). **집계 컬럼 없음**. 2행: 각 그룹 `주문건수 / 주문합계`.
  - 본문: `for mm=1..12` → `order_month = "{year}-{MM}"`. **12개월 모든 행 생성**(데이터 없는 달 0).
  - 각 행 9셀: 날짜 / 예약(건수·합계) / 일반(건수·합계) / 프로모션(건수·합계) / 합계(건수·합계).
    - **예약 셀은 비율 없음**(number_format만).
    - **일반·프로모션 셀은 셀 내부 `(비율%)` 병기**: 건수셀 = `number_format(count)<br/>({count>0 ? round(count*100/total_count,2) : ""}%)`, 합계셀 = `number_format(price)<br/>({price>0 ? round(price*100/total_price,2) : ""}%)`. total_count/total_price는 **해당 월 합계**.
  - **tfoot**(`table-light`):
    - 합계(th) / **예약 건수·합계 셀은 주석처리 → 빈칸**(legacy 171~172 `<?//=...?>`) / 일반 건수·합계(number_format+`(round(total/grand*100,2)%)`) / 프로모션 건수·합계(동일) / 총건수·총합계.
    - **tfoot 비율은 >0 가드 없음**(`round(($normal_total_count/$total_count)*100,2)`) — 데이터 없는 연도는 legacy division-by-zero(엣지). 프론트는 총합=0일 때 빈 문자열로 렌더(크래시 회피, 데이터 있는 연도는 동일).
- **세션/권한**: `lib.php`(admin 가드) → route-guard(#2) 소관.
- **AJAX / mutation**: **없음**(읽기전용). 하단 script 빈 `$(document).ready`.

### legacy dead/quirk
- 20행 `$selected['search_month']` — 월 select 미존재 dead.
- 154~155행 `$preorder_total_count += ...['normal']['total_count']` / `$preorder_total_price += ...['normal']['total_count']` — 예약 합계에 **normal 건수**를 잘못 누적(가격도 count 사용)하는 버그이나, **tfoot 출력이 주석처리**되어 미노출 → dead. 이식 불필요(빈칸만 렌더).

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) 직접 PDO.
- **Query**(선계산 테이블 `tbl_sales`):
  ```sql
  select date_format(ord_ymd,'%Y-%m') as order_month, is_preorder, is_promotion,
         sum(sales_count) as total_count, sum(sales_count*unit_price) as total_price
  from tbl_sales
  where date_format(ord_ymd,'%Y') = :order_year
  group by date_format(ord_ymd,'%Y-%m'), is_preorder, is_promotion
  ```
  분류: is_preorder='Y' → preorder / else is_promotion='Y' → promotion / else → normal. 월별 누적 + 월 합계.
- batch/로그 조회 없음(#228의 tbl_sales_log 미사용).

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/month-count`
- 요청: `search_year`(YYYY). 프론트 기본값(당년) 주입 후 항상 전달.
- 응답:
  ```ts
  type StatOrderMonthItem = {
    order_month: string;            // "YYYY-MM"
    preorder: StatOrderSalesBucket; // { total_count, total_price }
    normal: StatOrderSalesBucket;
    promotion: StatOrderSalesBucket;
    total_count: number;
    total_price: number;
  };
  type StatOrderMonthCountResponse = {
    search_year: string;
    months: StatOrderMonthItem[];   // sparse: tbl_sales에 존재하는 월만. 없는 달은 프론트 0
  };
  ```
- 백엔드 책임: Query group by 월/preorder/promotion → 월별 병합. **비율은 프론트 계산**. mutation 없음.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_month_count.tsx` → `/statistics/order/order_month_count`
- 스크린: `screens/statistics-order-month-count`
- 엔티티: `entities/statistics` 확장 — `fetchStatOrderMonthCount`/`useStatOrderMonthCount` + 타입(bucket은 #228 `StatOrderSalesBucket` 재사용)
- mock: `handlers/statistics.ts` 확장(GET month-count)

## Parity 체크리스트
- [ ] 검색폼 연도 select만(월 없음)·기본 당년
- [ ] 2행 헤더(예약/일반/프로모션/합계 각 건수·합계, 집계 컬럼 없음)·thead font-13 없음
- [ ] 12개월 전행 생성(데이터 없는 달 0)
- [ ] 예약 셀 비율 없음 / 일반·프로모션 셀 내부 `(비율%)` 병기·>0 가드
- [ ] tfoot 예약 빈칸·일반/프로모션 비율·총계
- [ ] 읽기전용(mutation 없음)·page_title "월별 주문현황"
