# 공급처 주문통계 (#232)

> 통계 주문 분석 5번째. 선택 연도의 공급처(퍼블리셔)별 일반/프로모션 판매 집계 + 비율. 읽기전용.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_publisher_count.php`
- 도메인: `AdminGoods::getPublisherNameFallback`(623), `Admin::getPublisherAllList`(패딩용, **dead**)
- 참조: `docs/legacy-admin/60-statistics.md`, #229/#230

## 화면·플로우
- **진입 URL**: `/statistics/order/order_publisher_count?search_year=YYYY`
- **GET 파라미터**: `search_year`(기본 `date('Y')`). 기간 = `{year}-01-01` ~ `{year}-12-31`.
- **page_title**: "공급처별 주문통계" · breadcrumb: 홈 / 통계 / 주문분석 / 공급처별 주문통계
- **검색폼**(GET): 연도 select(`연도` + 2013~현재) + `검색`. (`row row-cols-lg-auto`)
- **테이블**(`table table-bordered table-centered w-100 nowrap table-sm`, thead/tfoot **table-dark**):
  - 2행 헤더: 순위(rowspan2) / 퍼블리셔(rowspan2) / 일반판매(colspan2) / 프로모션(colspan2) / 합계(colspan2) / 주문건수비율(rowspan2,100px) / 주문금액비율(rowspan2,150px). 2행: 각 그룹 주문건수·주문금액.
  - 본문(font-13): 정렬(total_price desc) 순 `ranking=index+1`. 셀: 순위 / 퍼블리셔(getPublisherNameFallback) / 일반건수+`(비율%)` / 일반금액+`(비율%)` / 프로모션건수+`(비율%)` / 프로모션금액+`(비율%)` / 합계건수 / 합계금액 / 주문건수비율 / 주문금액비율.
    - 일반건수 비율 = `round(normal_count*100/(normal_count+promotion_count), 2)`, 일반금액 비율 = `round(normal_price*100/(normal_price+promotion_price), 2)`. 프로모션도 동일 분모(행 내 합).
    - **주문건수비율** = `round(total_count*100/grand_total_count, 2)`, **주문금액비율** = `round(total_price*100/grand_total_price, 4)`(4자리 quirk).
  - **tfoot**(table-dark): 합계(colspan2) / 일반건수+`(round(normal/grand_count*100,2)%)` / 일반금액+`(비율%)` / 프로모션건수+`(비율%)` / 프로모션금액+`(비율%)` / 합계건수(grand) / 합계금액(grand) / 빈칸 / 빈칸.
- **세션/권한**: `lib.php` admin 가드(route-guard #2).
- **mutation/AJAX**: **없음**. (하단 `btn_sales_count` JS는 대상 요소 부재 → dead)

### legacy dead/quirk
- **패딩 루프(77~88) 완전 dead**: `getPublisherAllList`가 `publisher_code`/`publisher_name` 컬럼 반환하나 코드가 `$sub_value['supplier_code']` 참조 → 항상 null → `if()` false → 루프 본문 no-op. 따라서 sales_data는 **첫 쿼리(47~72)만으로 확정**(단일카테고리 total=0 버그도 미발생). 이식 불필요.
- `$search_publisher` 미정의(99행 dead). `btn_sales_count`(236~254) dead. 주문금액비율 round **4자리**(주문건수비율 2자리와 상이) 이식.
- tfoot 일반/프로모션 비율 분모는 grand_total(주문건수/금액), 행 내 비율과 분모 상이(정상).

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO.
- **집계 쿼리**:
  ```sql
  select COALESCE(a.supplier_code,b.supplier_code) as supplier_code, a.is_promotion,
         sum(a.sales_count) as total_count, sum(a.sales_count*a.unit_price) as total_price
  from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code
  where a.ord_ymd between :start_date and :end_date
  group by COALESCE(a.supplier_code,b.supplier_code), a.is_promotion
  order by supplier_code asc, a.is_promotion asc
  ```
  → is_promotion Y/N별 공급처 집계. PHP: 공급처별 normal/promotion 버킷 + total(=normal+promotion), grand_total(raw 합). 정렬 `arr_sort(total_price desc)`.
- **getPublisherNameFallback**(AdminGoods:623): tbl_publisher.publisher_name → 없으면 directgames.tbl_publisher.publisher + `예전DB` badge → 없으면 코드.

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/publisher-count`
- 요청: `search_year`(YYYY). 프론트 기본값(당년) 주입.
- 응답:
  ```ts
  type StatPublisherRow = {
    supplier_code: string;
    publisher_name: string;      // 현재 DB 이름(없으면 "")
    old_publisher_name: string;  // 예전 DB 이름(없으면 "")
    normal: StatOrderDaySalesBucket;
    promotion: StatOrderDaySalesBucket;
    total_count: number;
    total_price: number;
  };
  type StatOrderPublisherCountResponse = {
    search_year: string;
    rows: StatPublisherRow[];     // total_price desc
    grand_total_count: number;    // raw 합(비율 분모)
    grand_total_price: number;
  };
  ```
- 백엔드 책임: 집계 쿼리 + 공급처별 normal/promotion 병합 + grand 합 + total_price desc 정렬 + getPublisherNameFallback(구조 필드로 반환). **비율은 프론트 계산**.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_publisher_count.tsx` → `/statistics/order/order_publisher_count`
- 스크린: `screens/statistics-order-publisher-count`
- 엔티티: `entities/statistics` 확장(publisher-count)
- mock: `handlers/statistics.ts` 확장(GET publisher-count)

## Parity 체크리스트
- [ ] 검색폼(연도 2013~현재·기본 당년)
- [ ] 2행 헤더·table-dark
- [ ] 정렬(total_price desc)·ranking·퍼블리셔명 폴백(예전DB badge)
- [ ] 일반/프로모션 셀 내부 비율(분모=행 합)·주문건수비율(round2)·주문금액비율(round4)
- [ ] tfoot 합계·일반/프로모션 비율(분모=grand)·마지막 2칸 빈칸
- [ ] 읽기전용(mutation 없음)·page_title "공급처별 주문통계"
