# 공급처 - 옵션상품 통계 (#233)

> 통계 주문 분석 6번째. 공급처+기간+상품유형 선택 시 옵션상품별 판매 목록 + 요약(합/최대/최소). 기간검색 daterangepicker(maxSpan 365).

## 원본
- 파일: `pc/_Admin_/statistics/order/order_goods_publisher_count.php`
- 도메인: `Admin::getSalesSupplierList`(공급처 드롭다운), `AdminGoods::getPublisherNameFallback`
- 참조: `docs/legacy-admin/60-statistics.md`, #231/#232

## 화면·플로우
- **진입 URL**: `/statistics/order/order_goods_publisher_count?search_start_date=&search_end_date=&search_supplier_code=&search_game_type=`
- **GET 파라미터**(legacy는 POST — 라우트는 GET search 변환, 기존 필터화면 선례): `search_start_date`(기본 오늘), `search_end_date`(기본 오늘), `search_supplier_code`, `search_game_type`(all/game/dlc/music/bundle).
- **page_title**: "공급처 - 옵션상품별 주문통계" · breadcrumb: 홈 / 통계 / 주문 분석 / (page_title)
- **데이터 조건**: `search_supplier_code`가 있을 때만 목록. 없으면 빈 목록(요약 0).
- **검색필터 카드**:
  - 기간검색: **daterangepicker**(bootstrap-daterangepicker, maxSpan **365**, ranges 오늘/어제/지난7일/지난30일/이번달/지난달) — 앱은 jQuery/moment 부재 → 로컬 React 재현(reportrange 박스 + 프리셋 + readonly 입력 + 직접선택 native date, DateRangePicker 선례 계승). **date_label 필드 없음**(order 공용과 상이). 시작·종료 기본 오늘.
  - 공급처: select(getSalesSupplierList 프리로드, 네이티브).
  - 옵션상품유형: radio 5(전체/Game/DLC/사운드트랙/번들).
  - **전체 기간** 버튼(btn_all_period, 2013-01-01~오늘 설정 후 제출) + **검색** 버튼.
- **"(검색기간: {start} ~ {end})"** 텍스트(필터 카드 아래).
- **요약 집계 테이블**(6컬럼, colgroup, thead `table-light font-14`): 총 주문수량/총 주문금액(+원)/최대 주문수량(+상품명)/최대 주문금액(+상품명·원)/최소 주문수량(+상품명)/최소 주문금액(+상품명·원). **프론트 계산**(rows에서 sum/max/min).
- **상세 테이블**(7컬럼, thead `table-light font-13`): 퍼블리셔명(getPublisherNameFallback)/옵션상품유형(game_type)/옵션상품코드/옵션상품명/출시일(substr 0,10)/주문수량/주문합계. tfoot 합계(colspan2 + 3 빈칸 + total_count + total_price).
- **세션/권한**: `lib.php` admin 가드.
- **mutation/AJAX**: 없음(읽기전용). jquery-number CDN은 미사용(표시용, 무시).

### legacy dead/quirk
- daterangepicker 2개월 달력 그리드는 native date input으로 대체(order DateRangePicker 선례). maxSpan 365는 직접선택 검증 상한으로 반영.
- 요약은 legacy가 PHP 계산(JS 의존 제거) — 프론트 계산으로 동일 재현.

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO.
- **목록 쿼리**(supplier 선택 시):
  ```sql
  select COALESCE(a.supplier_code,b.supplier_code) as supplier_code, b.game_type, b.release_date,
         a.product_code, a.product_name,
         sum(a.sales_count) as total_count, sum(a.sales_count*a.unit_price) as total_price
  from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code
  where a.ord_ymd between :start_date and :end_date
    and COALESCE(a.supplier_code,b.supplier_code)=:supplier_code [+ b.game_type=:game_type]
  group by a.product_code
  order by sum(a.sales_count) desc, sum(a.sales_count*a.unit_price) desc
  ```
- **getSalesSupplierList**(#231 재사용): 공급처 전체 프리로드.
- **getPublisherNameFallback**: 현재명 → 예전DB명+badge → 코드.

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/goods-publisher-count`
- 요청: `search_start_date`, `search_end_date`, `search_supplier_code`(있을 때만 데이터), `search_game_type`(all이면 미필터).
- 응답:
  ```ts
  type StatGoodsPublisherRow = {
    supplier_code: string;
    publisher_name: string;      // 현재 DB(없으면 "")
    old_publisher_name: string;  // 예전 DB(없으면 "")
    game_type: string;
    release_date: string;        // 원본(프론트 substr 0,10)
    product_code: string;
    product_name: string;
    total_count: number;
    total_price: number;
  };
  type StatOrderGoodsPublisherCountResponse = {
    search_start_date: string;
    search_end_date: string;
    rows: StatGoodsPublisherRow[]; // total_count desc, total_price desc
  };
  ```
- 백엔드 책임: 기간+공급처+유형 where, group by product_code, 정렬, getPublisherNameFallback(구조 필드). **요약·tfoot 합계는 프론트 계산**.
- 공급처 드롭다운: 기존 `GET /admin/statistics/order/goods-count/suppliers`(#231 getSalesSupplierList) 재사용.

## 타겟 매핑
- 라우트: `routes/statistics/order/order_goods_publisher_count.tsx`
- 스크린: `screens/statistics-order-goods-publisher-count` (로컬 date-range 컨트롤·요약 계산 포함)
- 엔티티: `entities/statistics` 확장(goods-publisher-count) + `useStatSalesSuppliers` 재사용
- mock: `handlers/statistics.ts` 확장(GET goods-publisher-count)

## Parity 체크리스트
- [ ] 기간(daterangepicker 재현·기본 오늘)·공급처 select·유형 radio·전체 기간 버튼·검색
- [ ] 공급처 미선택 시 빈 목록·요약 0
- [ ] "(검색기간: ~)" 텍스트
- [ ] 요약 6컬럼(합/최대/최소 + 상품명)·프론트 계산
- [ ] 상세 7컬럼·퍼블리셔명 폴백·출시일 substr·정렬·tfoot 합계
- [ ] 읽기전용·page_title
