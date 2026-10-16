# 기간별 주문통계 (#234)

> 통계 주문 분석 그룹 마지막. 기간(daterangepicker maxSpan 90)만으로 옵션상품별 판매 목록 + 요약. #233 축소판(공급처/유형/전체기간 버튼 없음).

## 원본
- 파일: `pc/_Admin_/statistics/order/sales_goods_day.php`
- 도메인: `AdminGoods::getPublisherNameFallback`
- 참조: `docs/legacy-admin/60-statistics.md`, #233

## 화면·플로우
- **진입 URL**: `/statistics/order/sales_goods_day?search_start_date=&search_end_date=`
- **GET 파라미터**(legacy POST → GET 변환): `search_start_date`(기본 오늘), `search_end_date`(기본 오늘).
- **page_title**: "기간별 주문통계" · breadcrumb: 홈 / 통계 / 주문 분석 / 기간별 주문통계
- **데이터**: 조건 없음 — 기간 내 판매 **항상 로드**(공급처 조건 없음).
- **검색필터 카드**: 기간검색 daterangepicker(**maxSpan 90**, ranges 오늘/어제/지난7일/지난30일/이번달/지난달) + `검색` 버튼. (#233과 달리 공급처/유형/전체 기간 버튼 없음)
- **"(검색기간: {start} ~ {end})"** 텍스트.
- **요약 집계 테이블**(6컬럼, colgroup, thead `table-light font-14`): 총 주문수량/총 주문금액(+원)/최대 주문수량(+상품)/최대 주문금액(+상품·원)/최소 주문수량(+상품)/최소 주문금액(+상품·원). legacy는 **JS 계산**(getMax/Min Price/Count, `$.number`) → **프론트 계산**으로 재현.
- **상세 테이블**(5컬럼, `table-striped`, thead `table-light font-13`): 퍼블리셔명(getPublisherNameFallback)/옵션상품코드/옵션상품명/주문수량/주문합계. tfoot 합계(colspan2 + 1 빈칸 + total_count + total_price).
- **세션/권한**: `lib.php` admin 가드.
- **mutation/AJAX**: 없음(읽기전용). jquery-number CDN 표시용(무시).

### legacy JS 요약 로직(프론트 재현)
- getMaxPrice/Count·getMinPrice/Count: 첫 행 시드(i==0 → n=tmp, index=0) 후 비교. 빈 목록이면 값 "0"·상품명 "". 정렬은 total_count desc라 최대수량=첫 행이지만 최대금액은 별도 탐색.
- totalSalePrice/Count = tfoot total(=목록 합).
- daterangepicker 2개월 달력 → native date input 대체(#233·order 선례). maxSpan 90 검증 반영.

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO.
- **목록 쿼리**:
  ```sql
  select COALESCE(a.supplier_code,b.supplier_code) as supplier_code, a.product_code, a.product_name,
         sum(a.sales_count) as total_count, sum(a.sales_count*a.unit_price) as total_price
  from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code
  where a.ord_ymd between :start_date and :end_date
  group by a.product_code, COALESCE(a.supplier_code,b.supplier_code)
  order by sum(a.sales_count) desc, sum(a.sales_count*a.unit_price) desc
  ```
- **getPublisherNameFallback**: 현재명 → 예전DB명+badge → 코드.

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/sales-goods-day`
- 요청: `search_start_date`, `search_end_date`.
- 응답:
  ```ts
  type StatSalesDayRow = {
    supplier_code: string;
    publisher_name: string;      // 현재 DB(없으면 "")
    old_publisher_name: string;  // 예전 DB(없으면 "")
    product_code: string;
    product_name: string;
    total_count: number;
    total_price: number;
  };
  type StatSalesGoodsDayResponse = {
    search_start_date: string;
    search_end_date: string;
    rows: StatSalesDayRow[];      // total_count desc, total_price desc
  };
  ```
- 백엔드 책임: 기간 where, group by product_code, 정렬, getPublisherNameFallback(구조 필드). **요약·tfoot 합계는 프론트 계산**.

## 타겟 매핑
- 라우트: `routes/statistics/order/sales_goods_day.tsx` → `/statistics/order/sales_goods_day`
- 스크린: `screens/statistics-sales-goods-day` (로컬 date-range 컨트롤 maxDays=90·요약 계산)
- 엔티티: `entities/statistics` 확장(sales-goods-day)
- mock: `handlers/statistics.ts` 확장(GET sales-goods-day)

## Parity 체크리스트
- [ ] 기간(daterangepicker 재현 maxSpan90·기본 오늘)·검색(공급처/유형/전체기간 없음)
- [ ] "(검색기간 ~)" 텍스트·데이터 항상 로드
- [ ] 요약 6컬럼(합/최대/최소+상품, 첫 행 시드 로직)·프론트 계산
- [ ] 상세 5컬럼 table-striped·퍼블리셔명 폴백·정렬·tfoot 합계
- [ ] 읽기전용·page_title "기간별 주문통계"
