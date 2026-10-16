# 할인 프로모션 주문통계

## 원본
- 파일: `pc/_Admin_/statistics/promotion/promotion_report.php` (sidebar_statistics.php `할인 프로모션 분석` 그룹 라이브 링크, 단일 항목)
- 배치: `pc/_Admin_/statistics/promotion/promotion_sales_batch.php` (집계 mutation, 전량 백엔드)
- 참조 문서: `docs/legacy-admin/60-statistics.md`, `../legacy-project/docs/STATISTICS-REPORTING.md`, `PROMOTION-EVENT-OPS.md`
- 변형 파일: `promotion/` 디렉토리에 report/batch 2개뿐 — report가 라이브.

## 화면·플로우
- 진입 URL/파라미터: `/_Admin_/statistics/promotion/promotion_report.php?page=&search_game_type=&search_key=&search_value=&search_supplier_code=&search_start=&search_end=&search_product_platform=`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 통계 / **프로모션 분석** / 할인 프로모션 주문통계 (그룹명 "프로모션 분석" — 사이드바 "할인 프로모션 분석"과 상이, 원문 유지)
  - h4 / page_title: "할인 프로모션 주문통계"
  - 검색필터 카드(header `bg-secondary text-white` "할인 프로모션 검색필터"):
    - 검색 select(`search_key`: 옵션상품명=search_name / 옵션상품명코드=search_product_code) + 검색어 input(`search_value`)
    - 플랫폼 select(`search_product_platform`): 선택/Steam(1)/Epic(34)/Ubisoft Connect(30)/Rockstar Games Launcher(35)/Bethesda(33)/Orgin(3)/기타(32) — **DEAD 필터**(폼·선택유지·페이지파라미터엔 포함되나 WHERE 미반영)
    - 공급처 select(`search_supplier_code`, select2): getSupplierList 목록
    - 진행기간: `search_start` ~ `search_end` text input (달력 위젯 없음, 자유 입력)
    - 옵션상품 구분 radio(`search_game_type`): 게임(game)/DLC(dlc)/사운드트랙(music)/번들(bundle)
    - 버튼: 할인 프로모션 검색(submit) / 필터 초기화(reset)
  - "전체 : {number_format(total_results)} 건"
  - 빨간 안내문 2줄:
    - ※ 집계되지 않은 일평균 데이터는 우측 버튼 클릭하면 반영됩니다.
    - ※ 집계처리 후 주문취소 건은 반영되지 않은 데이터입니다.
  - 결과 테이블(table-dark 헤더, colgroup 11열): 공급처 / 옵션상품코드 / 옵션상품명 / 할인프로모션 진행기간 / 진행일수 / 할인가 / 할인율 / 주문수량 / 주문금액 / 일평균 / 집계
  - 서버 페이지네이션(links_html → ServerPagination), 50/page.
- 폼 필드/검증: GET, 클라이언트 검증 없음. reset 버튼은 브라우저 기본 폼 리셋(제출 아님).
- 분기/리다이렉트: 진행기간 셀 링크 → `promotion_report.php?search_start=X&search_end=Y` (다른 필터 없이 이동, page 리셋).
- 세션/권한 의존: admin 공통 include, statistics topmenu/sidebar. 서버 권한 강제는 백엔드 책임.

## 행 표시 계산 (legacy 그대로 — quirk 포함)
- 공급처: `AdminGoods::getPublisherName(publisher_code)` (tbl_publisher 단순 조회, 없으면 빈값 — 폴백/뱃지 없음) → 백엔드가 `publisher_name`으로 해석해 내려준다.
- 옵션상품코드: `product_code` (`span.num`).
- 옵션상품명: `product_name`.
- 진행기간: `<a href="...search_start=start&search_end=end">{start} ~ {end}</a>` (`span.num`).
- 진행일수: `event_term = (strtotime(end)-strtotime(start))/3600/24` → `round(event_term, 2)` 일. (프론트에서 timestamp diff로 계산)
- 할인가: `number_format(sale_price)` (`span.num`).
- 할인율: 빨간 하향 화살표 아이콘(`mdi mdi-arrow-down-bold`) + `{discount_rate}%` (`text-danger num`). discount_rate는 **raw echo**(포맷 없음) → 문자열 원형 유지.
- 주문수량: `if(order_count)` 참일 때만 `number_format(order_count)`, 아니면 **빈칸**. (null·0 모두 빈칸 — `if(0)`/`if(null)` falsy)
- 주문금액: `number_format(order_price)` (`span.num`).
- 일평균: `if(order_count>0)` 참일 때만 `round(order_count/event_term, 1)`, 아니면 빈칸.
- 집계 버튼: `promotion_status=="E" && order_count==""` 일 때만 표시(`btn-danger btn-sm btn_promotion_count_all`, data-productcode/start/end/saleprice).
  - `order_count==""`: DB **NULL(미집계)** 만 참(`NULL==""` true). 집계 후 값 `"0"`은 `"0"==""` false → 버튼 미표시. → 모델상 `order_count === null`(미집계)에서만 버튼.
- 행 상태(tr_class): 진행예정(C, start>now && end>now)·진행중(I, start<=now && end>=now) → `table-active`, 종료(E) → `""`.
  - **base WHERE가 `promotion_end < now`이므로 데이터셋은 항상 E** → tr_class 항상 `""`, 집계 버튼 노출 가능. C/I 분기는 사실상 dead지만 timestamp 기반으로 그대로 계산.

## 데이터 (legacy)
- 도메인 클래스·메서드:
  - `Admin::getPromotionHistory($page, $add_where, $orderby, $param)` — 목록/페이징(50/page).
  - `Admin::getSupplierList()` — 공급처 select 목록.
  - `AdminGoods::getPublisherName($publisher_code)` — 행별 공급처명.
- SQL 요약 (getPromotionHistory):
  - `select a.*, b.product_name, b.game_type, b.display_type, b.release_date, b.product_platform from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code where a.discount_rate>'0' {add_where} order by {orderby}`
  - base: `a.discount_rate > '0'` + `promotion_end < now()`
  - 필터(add_where):
    - `search_game_type` → `b.game_type = ...`
    - `search_key=search_name` + value → `(b.product_name like %v% or b.product_name_en like %v%)`
    - `search_key=search_product_code` + value → `a.product_code = v`
    - `search_start` → `a.promotion_start = v` (정확 일치)
    - `search_end` → `a.promotion_end = v` (정확 일치)
    - `search_supplier_code` → `a.publisher_code = v`
    - `search_product_platform` → **미사용(dead)**
  - orderby: `a.promotion_end desc, a.promotion_start desc, a.publisher_code desc`
  - 50/page, links_html(Pagination.php)
- SQL 요약 (getSupplierList): `tbl_goods_item a ⋈ tbl_publisher b (a.supplier_code=b.publisher_code), find_in_set(status,'0,1,9') group by supplier_code order by publisher_name asc` → `{publisher_code, publisher_name}[]`
- 집계 배치(promotion_sales_batch.php, mode=promotion_all_batch): tbl_order⋈tbl_order_item⋈(tbl_promotion_schedule) 집계 → tbl_sales_promotion upsert + tbl_sales is_promotion='Y' + tbl_promotion_schedule.order_count/order_price 갱신. **전량 백엔드 책임.**

## API 계약 (백엔드 전달)
- `GET /admin/statistics/promotion/report`
  - query:
    - `page: number` (기본 1)
    - `search_key: string` (search_name | search_product_code | "")
    - `search_value: string`
    - `search_supplier_code: string`
    - `search_start: string` (promotion_start 정확 일치)
    - `search_end: string` (promotion_end 정확 일치)
    - `search_game_type: string` (game | dlc | music | bundle | "")
    - `search_product_platform: string` — **수신하되 결과에 영향 없음(dead)**, URL/선택 유지 목적
  - response:
    ```ts
    {
      items: Array<{
        publisher_code: string;
        publisher_name: string;   // getPublisherName 해석(없으면 "")
        product_code: string;
        product_name: string;
        promotion_start: string;  // "YYYY-MM-DD HH:MM:SS"
        promotion_end: string;
        sale_price: number;
        discount_rate: string;    // raw echo(포맷 없음)
        order_count: number | null; // null=미집계, 0=집계됨(판매0), 양수=집계됨
        order_price: number;
      }>;
      pagination: { current_page: number; total_pages: number; total_results: number };
    }
    ```
  - 백엔드 책임:
    - base `discount_rate>0` + `promotion_end < now()` + 위 필터(정확 일치 start/end, like name, game_type, supplier), orderby(end desc/start desc/publisher desc), 50/page.
    - `publisher_name`을 tbl_publisher에서 해석(getPublisherName, 폴백 없음, 없으면 "").
    - `order_count`는 미집계 시 **null**로 내려준다(집계 후 0/양수 구분 위해).
    - `search_product_platform`은 무시한다(legacy WHERE 미반영).
- `GET /admin/statistics/promotion/report/suppliers` — 공급처 select 목록(getSupplierList)
  - response: `{ suppliers: Array<{ publisher_code: string; publisher_name: string }> }`
- `POST /admin/statistics/promotion/report/batch` — 집계(promotion_all_batch)
  - body: `{ product_code: string; promotion_start: string; promotion_end: string; sale_price: number }`
  - response: `{ success: boolean }`
  - 백엔드 책임: promotion_sales_batch.php 전체 집계 로직(tbl_sales_promotion upsert·tbl_sales is_promotion·tbl_promotion_schedule order_count/order_price 갱신). 성공 시 프론트가 목록 invalidate(=reload).

## 타겟 매핑
- 라우트: `apps/directg-admin/src/routes/statistics/promotion/promotion_report.tsx` → `/statistics/promotion/promotion_report`
- screen: `apps/directg-admin/src/screens/statistics-promotion-report`
- entities: `apps/directg-admin/src/entities/statistics` (promotion-report 슬라이스 확장)
- mock: `apps/directg-admin/src/shared/mocks/handlers/statistics.ts`
- 사이드바: STATISTICS_SIDE_NAV `할인 프로모션 주문통계` → `/statistics/promotion/promotion_report` (#228 기등록)

## Parity 체크리스트
- [x] 화면 요소 일치 (검색필터 카드·11열 테이블·안내문 2줄·전체건수)
- [x] 필드/검증 일치 (search_key/value·platform(dead)·supplier·start/end·game_type radio)
- [x] 분기/플로우 일치 (진행기간 링크·서버 페이징 50/page·집계 버튼 POST→reload)
- [x] 엣지케이스 일치 (order_count null/0/양수 표시 분기·집계버튼 null만·진행일수 round2·일평균 round1·discount_rate raw·platform dead·status 항상 E)
