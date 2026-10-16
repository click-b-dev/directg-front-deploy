# 어드민 — 통계(Statistics)

> 대상: `pc/_Admin_/statistics/` (47개 화면) + 사이드바 `inc/sidebar_statistics.php`.
> 도메인 계약(집계 정의·업무 규칙)은 `legacy-project/docs/STATISTICS-REPORTING.md`, `BUSINESS-RULES.md`가 단일 진실 원천이다. 이 문서는 화면 단위 이관용 기반 문서로, 중복 서술 대신 화면별 유형·집계축·데이터소스·연계 위주로 정리한다.
> 공통 인프라(세션가드, `$conn`/`$conn_dgkr`, admin_head/topbar/sidebar/footer 레이아웃, jQuery/Bootstrap5, 공통 JS)는 상위 기반 문서 참조 — 여기서는 통계 특이사항만 기재한다.

## 개요

통계 영역은 5개 하위 그룹으로 나뉜다. **주문(order) 37 / 매출(sales) 4 / 상품(goods) 3 / 프로모션(promotion) 2 / 이벤트(event) 1.** topbar 진입점은 `statistics/order/order_day_count.php`이며 사이드바 활성 키는 모든 화면이 `$topmenu['statistics']="active"`로 설정한다.

공통 성격:

- **화면 유형**은 대부분 "필터 폼(GET) → SQL 집계 → HTML 표(합계 tfoot 포함)" 구조다. 차트는 예외적으로만 사용(아래 표 참조). 페이징이 있는 목록형은 클래스 헬퍼(`Admin`/`AdminOrder`/`AdminGoods`)의 `getXxx(...)`가 `resultset`/`links_html`/`total_results`를 담은 객체를 반환한다.
- **집계 대상 테이블**은 크게 세 부류다.
  - 자사 판매 집계 스냅샷: `tbl_sales`(옵션상품 판매라인: `product_code, ord_ymd, unit_price, sales_count, is_preorder, is_promotion, supplier_code`), 일별 매출 집계 `tbl_sales_day`, 집계로그 `tbl_sales_log`.
  - 원천 주문: `tbl_order`(`step='2'` 결제완료, `pg_provider`, `total_price`), 연도별 아카이브 `tbl_order_YYYY`/`tbl_order_item_YYYY`(dgkr DB, `$conn_dgkr`).
  - 외부 채널 주문라인: `tbl_order_item_vaultn` / `tbl_order_item_genba` / `tbl_order_item_ztorm` / Asset 관련 테이블(클래스 경유).
- **공통 필터**: 대다수 화면이 `search_year`/`search_month`(+ 일별은 `search_day`) 드롭다운을 쓰며 미지정 시 `date('Y')`/`date('m')`/`date('d')`로 기본값. 연도 옵션은 항상 `2013 ~ date('Y')`. 기간형 화면(`sales_goods_day`, `order_goods_publisher_count`, `event_order_count`)은 `search_start_date`/`search_end_date` (daterangepicker, 최대 90일)를 쓴다.
- **집계 배치**: 일부 화면은 표시 행에 "집계" 버튼이 있고, AJAX로 `order_count_batch.php`(연도별 아카이브 재집계) 또는 `promotion_sales_batch.php`(프로모션 일평균 재집계)를 POST 호출 후 `location.reload()`한다.
- **금액 규칙**: 외부 채널 화면은 `GrossAmount`(부가세 포함) / `NetAmount`(= Gross/1.1) / `ActualBuyingPrice`(원가) 3지표와 "DGKR 이익 = Net − 원가" 및 이익률(%)을 계산해 마진 음수면 `text-danger` 처리한다. Genba는 원가 300 미만이면 `×1500` 환율 보정하는 특이 규칙 있음(추정: USD→KRW).

## 메뉴 트리 (sidebar_statistics.php 기준)

주석 처리(`<!-- -->`)되어 비활성인 항목과 `[X]` 접두 항목은 **미노출**이다. 현재 노출되는 트리:

- **상품 분석** (`#sidebarGoods`)
  - 인기타이틀 순위 → `goods/title_ranking.php`
  - Metacritic Score → `goods/metacritic_score.php`
  - (비활성: 공급처별/예약판매 상품현황, 장바구니/위시리스트)
- **주문 분석** (`#sidebarOrder`)
  - 일별 주문집계 → `order/order_day_count.php`
  - 월별 주문집계 → `order/order_month_count.php`
  - 대표상품별 주문통계 → `order/order_title_count.php`
  - 옵션상품별 주문통계 → `order/order_goods_count.php`
  - 공급처 주문통계 → `order/order_publisher_count.php`
  - 공급처 - 옵션상품 통계 → `order/order_goods_publisher_count.php`
  - 기간별 주문통계 → `order/sales_goods_day.php`
  - (비활성: 실물상품별 주문현황 `order_retail_count.php`, 누적판매순위 `goods_ranking.php`)
- **Asset 주문 분석** (`#sidebarOrderAsset`)
  - Asset 일별 주문현황 → `order/order_asset_day_count.php`
  - Asset 월별 주문현황 → `order/order_asset_month_count.php`
  - (비활성: Asset 퍼블리셔/누적 `order_asset_total_count.php`)
- **Ztorm 주문 분석** (`#sidebarOrderZtorm`)
  - Ztorm 일별/월별 주문현황 → `order/order_ztorm_day_count.php` / `order_ztorm_month_count.php`
- **Genba 주문 분석** (`#sidebarOrderGenba`)
  - Genba 일별/월별/퍼블리셔/누적 → `order_genba_day_count.php` / `order_genba_month_count.php` / `genba_publisher_count.php` / `genba_total_count.php`
- **Vaultn 주문 분석** (`#sidebarOrderVaultn`)
  - Vaultn 일별/월별/누적/리포트비교 → `order_vaultn_day_count.php` / `order_vaultn_month_count.php` / `vaultn_total_count.php` / `order_vaultn_month_count_compare.php`
- **홀로 모델 주문 분석** (`#sidebarOrderHolomodels`)
  - 홀로 모델 월별 주문현황 → `order/order_holomodels_count.php`
- **결제 분석** (`#sidebarSales`)
  - 일별 매출현황 → `sales/sales_day.php`
  - 월별 매출현황 → `sales/sales_month.php`
  - PG별 결제현황 → `sales/sales_pg.php`
  - (비활성/`[X]`: 결제수단별 `sales_settlekind.php`, 포인트 `sales_emoney.php`, 타이틀별 `sales_title.php`, 공급처별)
- **할인 프로모션 분석** (`#sidebarPromotion`)
  - 할인 프로모션 주문통계 → `promotion/promotion_report.php`
- (전체 비활성 그룹: 회원 분석, 제휴DG 분석, 프로모션 진행이력, 랜덤박스 통계)

메뉴 미노출이지만 파일이 존재하는 화면(`goods_item_report`, `event_order_count`, `order_retail_count`, 각종 total/compare)은 직접 URL·다른 화면 링크로 진입 가능하므로 이관 대상에 포함한다.

## 페이지별 정의

### 주문(order) 그룹 — 37개

#### 기간 집계형 (자사 tbl_sales 기반)

##### 일별 주문현황 — `statistics/order/order_day_count.php`
- 유형: 필터 폼 + 월 단위 일별 표(예약/일반/프로모션/합계 컬럼, 비율 계산), 행별 "집계" 버튼.
- 기능: 집계축 = `ord_ymd × is_preorder × is_promotion`. 지표 = 주문건수(`sum(sales_count)`), 주문합계(`sum(sales_count*unit_price)`), 건수/금액 비율.
- 데이터소스: `tbl_sales` `group by ord_ymd,is_preorder,is_promotion`; 집계일 표시용 `tbl_sales_log`.
- 파라미터: `search_year`,`search_month` (기본 당월).
- 연계: 행 "집계" 버튼 → POST `order_count_batch.php` (`mode=batch_day`).

##### 월별 주문현황 — `statistics/order/order_month_count.php`
- 유형/기능: `order_day_count`의 월 롤업. 집계축 = `date_format(ord_ymd,'%Y-%m') × is_preorder × is_promotion`, 지표 동일.
- 데이터소스: `tbl_sales`, `where date_format(ord_ymd,'%Y')=:order_year`.
- 파라미터: `search_year`(연도만).

##### 대표상품별 주문현황 — `statistics/order/order_title_count.php`
- 유형: 대표상품(title) 순위 표, 기본게임/에디션/DLC/합계 수량·금액 컬럼, 매출금액 desc 정렬.
- 기능: 집계축 = title_id × product_type(game/edition/dlc). 지표 = 수량·금액. `Admin::getTitleSalesCount(start,end)` 결과를 PHP에서 title별로 재그룹핑, `array_multisort`로 순위화.
- 데이터소스: `Admin`(`getTitleSalesCount`,`getTitleName`), `AdminGoods`.
- 파라미터: `search_year`(기본 당해), `search_month`(선택; 미지정 시 연간).
- 연계: "인기 타이틀 저장" 버튼 → POST `title_order_ps.php` (`mode=best_game_save`).

##### 옵션상품 주문통계 — `statistics/order/order_goods_count.php`
- 유형: 옵션상품 단건 조회형. 공급처(select2 프리로드) + 옵션상품(select2 원격검색) + 연도 선택 → 판매가격별/일자별 표 + 프로모션 이력.
- 기능: 집계축 = `product_code` 고정, `COALESCE(a.supplier_code,b.supplier_code) × unit_price`(가격별) 및 `× ord_ymd`(일자별). 지표 = `sum(sales_count)`. 공급처 미선택 시 공급처별 분리 표시.
- 데이터소스: `tbl_sales a left join tbl_goods_item b left join tbl_publisher c left join directgames.tbl_publisher d`(과거 공급처명 폴백), `tbl_promotion_schedule`. 클래스 `Admin::getSalesSupplierList/getGoodsItemInfo`, `AdminGoods`.
- 파라미터: `search_year`(또는 `all`), `search_product_code`, `search_supplier_code`.
- 연계: select2 원격검색 AJAX → `ajax_sales_product.php`(상품), `ajax_product_supplier.php`(공급처). 엑셀 다운로드 → `order_goods_count_download.php`.
- 참조: 공급처 귀속은 "주문시점 `tbl_sales.supplier_code` 우선, NULL이면 현재 공급처 폴백" 규칙 — 이관 시 COALESCE 로직 보존 필수.

##### 공급처별 주문통계 — `statistics/order/order_publisher_count.php`
- 유형: 연도 필터 + 공급처 목록 표(일반/프로모션/합계).
- 기능: 집계축 = `COALESCE(supplier_code) × is_promotion`, 지표 = 수량·금액. `where ord_ymd between :연초 and :연말`.
- 데이터소스: `tbl_sales a inner join tbl_goods_item b`, `Admin::getPublisherAllList`. (연계: `mongo_order_goods_batch.php` 참조 — 추정: 별도 배치)
- 파라미터: `search_year`.

##### 공급처 - 옵션상품별 주문통계 — `statistics/order/order_goods_publisher_count.php`
- 유형: 기간 + 공급처 + 게임유형 필터, 공급처별 옵션상품 순위.
- 기능: 집계축 = `a.product_code`(공급처 필터 하), 지표 = `sum(sales_count)`, 금액 desc 정렬.
- 데이터소스: `tbl_sales` + `AdminGoods::getPublisherNameFallback`, `Admin::getSalesSupplierList`.
- 파라미터: `search_start_date`,`search_end_date`,`search_supplier_code`,`search_game_type`.

##### 기간별 주문통계 — `statistics/order/sales_goods_day.php`
- 유형: 기간(POST) 필터 + 옵션상품 순위 표.
- 기능: 집계축 = `product_code × COALESCE(supplier_code)`, 지표 = 수량·금액 desc.
- 데이터소스: `tbl_sales a inner join tbl_goods_item b`, `where ord_ymd between`.
- 파라미터: `search_start_date`,`search_end_date` (POST, daterangepicker).

##### 옵션상품별 리포트 — `statistics/order/goods_item_report.php`
- 유형: 단일 옵션상품 상세 리포트(출시 후/프로모션 전 판매추이). ApexCharts 사용.
- 기능: 집계축 = `product_code` 고정, `ord_ymd`(및 `× unit_price`) 일자별 추이 + 프로모션 구간. 지표 = `sum(sales_count)`, `count(*)as day_diff`.
- 데이터소스: `tbl_goods_item`, `tbl_sales`(다중 group by). AJAX 차트 데이터 `ajax_order_goods_count.php`, 배치 `mongo_order_goods_batch.php`.
- 파라미터: `product_code`.

#### 외부 채널 (Vaultn / Genba / Ztorm) — 채널 SKU 라인 집계

공통: 일/월/누적 3형태 + 마진 계산(Gross/Net/ActualBuying/DGKR이익). 미매핑 SKU 행에 "동기화" 버튼(카탈로그 sync AJAX).

##### Vaultn 일별 — `statistics/order/order_vaultn_day_count.php`
- 데이터소스: `tbl_order_item_vaultn` `where ord_ymd=:ord_ymd group by sku order by sum(salesPriceGross) desc`. 컬럼 `sku,Name,publisherName,salesPriceGross,netPurchasePrice`. Net = Gross/1.1.
- 파라미터: `search_year/month/day`. 연계: `vaultn_catalogue_sync.php` (SKU 동기화).

##### Vaultn 월별 — `order_vaultn_month_count.php` / 누적 — `vaultn_total_count.php`(페이징) / 리포트비교 — `order_vaultn_month_count_compare.php`(`AdminOrder`) / 단일 — `order_vaultn_count.php`(`group by sku order by sum(salesPriceGross)`).
- 파라미터: 월별/비교는 `search_year,search_month,search_publisher`; 누적은 `page`.

##### 환불 Vaultn 월별 — `statistics/order/refund_vaultn_month_count.php`
- 유형/기능: Vaultn 환불 집계(`group by sku order by count(*) desc`). 파라미터 `search_year,search_month,search_publisher`. (환불 데이터소스: `tbl_order_item_vaultn` 계열 — 추정)

##### Genba 일별 — `statistics/order/order_genba_day_count.php`
- 데이터소스: `tbl_order_item_genba` `where ord_ymd=:ord_ymd and Sku is not null group by Sku order by sum(GrossAmount) desc`. 컬럼 `Sku,Name,Publisher,NetAmount,GrossAmount,ActualBuyingPrice`. **원가<300이면 ×1500 보정.**
- 연계: `genba_catalogue_sync.php`. 파라미터 `search_year/month/day`.

##### Genba 월별 — `order_genba_month_count.php` / 퍼블리셔 — `genba_publisher_count.php`(`group by Publisher order by sum(GrossAmount) desc`) / 누적 — `genba_total_count.php`(페이징).

##### Ztorm 일별 — `statistics/order/order_ztorm_day_count.php` / 월별 — `order_ztorm_month_count.php`
- 데이터소스: `tbl_order_item_ztorm` `group by ztorm_item_id order by count(*) desc`. 컬럼 `ztorm_item_id,ztorm_item_name,ztorm_publisher`. (Gross/Net/원가 컬럼은 표시하나 쿼리에서 미집계 — 값 비어있을 수 있음, 확인필요)
- 파라미터: 일별 `search_year/month/day`, 월별 `search_year/month`.

#### Asset 그룹

##### Asset 일별 — `statistics/order/order_asset_day_count.php`
- 유형: 일자 필터 + 페이징 목록(asset_id/name/publisher/type/platform/수량).
- 데이터소스: `Admin::getOrderAssetDayCount(page,add_where,orderby,param,30)`. `add_where = "and b.ord_ymd='...'"`.
- 파라미터: `search_year/month/day`,`page`.

##### Asset 월별 — `order_asset_month_count.php` (`search_year/month/page`, `getOrderAssetMonthCount` 계열 추정).
##### Asset 누적 — `order_asset_total_count.php` (비활성 메뉴)
- 필터: `publisherCd`,`assetTypeCd`,`productTypeCd`,`search_asset_name`,`page`. `Admin::getAssetCodeInfo`로 코드→명 변환 후 `a.publisher/assetType/productType` where. 목록형 페이징.

#### 홀로 모델

##### 홀로 모델 월별 — `statistics/order/order_holomodels_count.php`
- 데이터소스: `Admin::getHolomodelsSalesCount(start,end)`. 파라미터 `search_year,search_month`.

#### 기타 / 배치·유틸 (order 하위)

- **실물상품별 주문현황** — `order_retail_count.php`(비활성): `AdminOrder::getOrderRetailCount(start,end)`, 파라미터 `search_year,search_month`.
- **누적판매순위** — `goods_ranking.php`(비활성): `tbl_sales`(또는 별칭 a) `group by a.product_code,a.is_preorder,a.is_promotion`. 필터 `search_publisher,search_game_type,search_year`.
- **주문 재집계 배치** — `order_count_batch.php` / `order_count_batch2.php` (화면 아님): POST `mode=batch_day` + `search_year`(2013~) 분기 → 연도별 아카이브 `tbl_order_YYYY`/`tbl_order_item_YYYY`(`$conn_dgkr`, `where step='2' and status='2' and ord_ymd=:ord_ymd group by product_code,tot_pay`)를 읽어 `tbl_sales`/`tbl_sales_log` 재집계. 이관 시 서버 액션(라우트)로 분리 필요.
- **대표상품 저장 액션** — `title_order_ps.php` (order/ 및 goods/ 양쪽 존재): `mode=best_game_save`로 인기 타이틀 스냅샷 저장.
- **AJAX 헬퍼(화면 아님)**: `ajax_sales_product.php`(JSON, 상품 원격검색), `ajax_product_supplier.php`, `ajax_publisher_goods_item.php`, `ajax_order_goods_count.php`(차트 데이터).
- **다운로드**: `order_goods_count_download.php` — `Content-Type: application/vnd.ms-excel` + `.xls` 첨부로 HTML 표를 엑셀로 내보냄(SheetJS 아님, PHP HTML-as-xls 방식). `group by COALESCE(supplier_code),ord_ymd,unit_price`.
- **랜덤박스** — `randombox_history.php`(페이징 목록), `randombox_report.php`(ApexCharts, `product_code`, `group by time_diff`) — 메뉴 비활성.
- **기타 변형**: `yjs_order_goods_count.php`(`order_goods_count` 변형, `ajax_publisher_goods_item.php` 연계), `title_order_ps.php`.

### 매출/결제(sales) 그룹 — 4개

##### 일별 매출현황 — `statistics/sales/sales_day.php`
- 유형: 월 단위 일별 표(결제건수/결제금액/포인트할인/할인비율/주문금액).
- 데이터소스: `tbl_sales_day` `where order_day between` — 컬럼 `order_price,checkout_price,checkout_count,emoney,batch_date`(사전 집계 스냅샷).
- 파라미터: `search_year,search_month`.

##### 월별 매출현황 — `statistics/sales/sales_month.php`
- 데이터소스: `tbl_sales_day` `group by date_format(order_day,'%Y-%m')`, `sum(order_price/checkout_price/checkout_count/emoney)`. 파라미터 `search_year,search_month`.

##### PG별 결제현황 — `statistics/sales/sales_pg.php`
- 유형: 일별 × PG사(KCP/네이버페이/페이코/토스페이먼츠/토스페이) 결제건수·금액·비율 표.
- 데이터소스: **`tbl_order` `where step='2' and ord_ymd between group by ord_ymd,pg_provider`**, `count(*)`, `sum(total_price)`. `pg_provider` 값: `kcp/naverpay/payco/toss/toss_pay`.
- 파라미터: `search_year,search_month`.
- 참조: 통계 그룹 중 유일하게 원천 `tbl_order`를 직접 집계(집계 스냅샷 아님). PG 컬럼은 하드코딩 — 이관 시 PG 목록 상수화 필요.

##### 타이틀별 매출현황 — `statistics/sales/sales_title.php` (메뉴 `[X]` 비활성)
- ApexCharts. `tbl_goods`(title) 목록 → title별 game/dlc 매출. `Admin::getPublisherAllList/getTitleGame/getTitleDLC`. 파라미터 `search_publisher,search_year`.

### 상품(goods) 그룹 — 3개

##### 인기타이틀 순위 — `statistics/goods/title_ranking.php`
- 유형: 연/월 필터 + 페이징 순위 목록.
- 데이터소스: `Admin::getTitleRanking(page,add_where,orderby,param)`. `where a.sales_year=.. and a.sales_month=..`, `orderby (sum(a.total_price)+sum(a.dlc_price)) desc`. (사전 집계된 `best`/랭킹 테이블 기반 — `sales_year/sales_month/total_price/dlc_price` 컬럼)
- 파라미터: `search_year,search_month,page`. 연계: `title_order_ps.php`.

##### Metacritic Score — `statistics/goods/metacritic_score.php`
- 유형: 출시연도 필터 + 페이징 목록, `metacritic_score desc` 정렬.
- 데이터소스: `AdminGoods` 계열, `where date_format(a.release_date,'%Y')=:search_year`. 파라미터 `search_year,page`. (집계보다 상품속성 조회형)

##### `goods/title_order_ps.php` — 저장 액션(화면 아님, `order/title_order_ps.php`와 동종).

### 프로모션(promotion) 그룹 — 2개

##### 할인 프로모션 주문통계 — `statistics/promotion/promotion_report.php`
- 유형: 다중 필터(상품/플랫폼/공급처/진행기간/게임유형) + 페이징 목록. 종료 프로모션만(`promotion_end<now`). 행별 진행상태(예정 C/진행 I/종료 E) 색상, 미집계 종료건에 "집계" 버튼.
- 기능: 프로모션별 진행기간·할인가·할인율·주문수량·주문금액·일평균(`order_count/진행일수`).
- 데이터소스: `Admin::getPromotionHistory(page,add_where,orderby,param)`, `Admin::getSupplierList`, `AdminGoods::getPublisherName`. where는 문자열 조립(`b.game_type`, `product_name like`, `a.product_code`, `a.promotion_start/end`, `a.publisher_code`).
- 파라미터: `page,search_game_type,search_key,search_value,search_supplier_code,search_start,search_end`(+폼상 `search_product_platform`).
- 연계: "집계" 버튼 → POST `promotion_sales_batch.php` (`mode=promotion_all_batch`, `product_code/promotion_start/promotion_end/sale_price`).

##### `promotion/promotion_sales_batch.php` — 배치(화면 아님)
- `mode=promotion_all_batch` 시 `GROUP BY b.product_code,day_diff`로 프로모션 판매 재집계. 파라미터 `product_code,publisher_code,promotion_start,promotion_end,promotion_srp,sale_price`.

### 이벤트(event) 그룹 — 1개

##### 이벤트 - 옵션상품 통계 — `statistics/event/event_order_count.php`
- 유형: 단일 이벤트 상세(배너/설명 Parsedown 렌더) + 이벤트 유형(`event_gubun`)별 다른 표.
  - gubun 1/4/9: 관련상품 목록 + 주문수량/합계 (`AdminOrder::getEventGoodsOrderCount`).
  - gubun 2: 네이버페이 즉시할인 (`getEventNaverpayCount`).
  - gubun 3: 토스 즉시할인 쿠폰별 (`getEventTossCount`).
- 데이터소스: `tbl_event`(idx), `tbl_event_goods a inner join tbl_goods_item b`, `AdminOrder`/`AdminGoods`/`Parsedown`. 클라이언트에서 최대/최소 주문금액·수량 JS 계산.
- 파라미터: `event_no`. daterangepicker(최대 90일) 있으나 기간은 주로 `event_data.start_date~end_date` 사용.

## 지표·집계축 요약표

| 화면 | 집계축 (GROUP BY) | 지표 | 기간필터 | 내보내기/차트 |
|---|---|---|---|---|
| order_day_count | ord_ymd × is_preorder × is_promotion | 건수·금액·비율 | year+month | — (집계배치) |
| order_month_count | %Y-%m × is_preorder × is_promotion | 건수·금액 | year | — |
| order_title_count | title_id × product_type | 수량·금액(순위) | year(+month) | — (저장) |
| order_goods_count | product_code × supplier × unit_price(× ord_ymd) | sales_count | year/all | 엑셀 down |
| order_publisher_count | COALESCE(supplier) × is_promotion | 수량·금액 | year | — |
| order_goods_publisher_count | product_code (공급처 필터) | 수량·금액 | start~end date | — |
| sales_goods_day | product_code × supplier | 수량·금액 | start~end date | — |
| goods_item_report | product_code × ord_ymd(× unit_price) | sales_count | (상품고정) | ApexCharts |
| goods_ranking | product_code × is_preorder × is_promotion | 수량·금액 | year | — |
| vaultn/genba/ztorm _day/_month | sku/Sku/ztorm_item_id (또는 Publisher) | 수량·Gross·Net·원가·이익 | year/month(/day) | 동기화 AJAX |
| refund_vaultn_month | sku | 환불건수 | year/month/publisher | — |
| order_asset_day/month | asset 목록 | 수량 | year/month(/day) | 페이징 |
| order_asset_total | publisher/assetType/productType | 수량 | (누적) | 페이징 |
| order_holomodels_count | (클래스) | 수량·금액 | year/month | — |
| order_retail_count | (클래스) | 수량 | year/month | — |
| sales_day | order_day (스냅샷 직접) | 결제건수·금액·포인트·주문금액 | year/month | — |
| sales_month | %Y-%m (sales_day 롤업) | 결제/주문/포인트 | year | — |
| sales_pg | ord_ymd × pg_provider (tbl_order) | 결제건수·금액·비율 | year/month | — |
| sales_title | title × game/dlc | 매출 | year/publisher | ApexCharts |
| title_ranking | (사전집계 랭킹테이블) | 매출순위 | year/month | 페이징 |
| metacritic_score | release_year | score순 목록 | year | 페이징 |
| promotion_report | 프로모션 이력 | 수량·금액·일평균·할인율 | start~end + 다중 | 집계배치 |
| event_order_count | event_gubun별 상이 | 수량·금액·즉시할인 | event 기간 | JS 계산 |

## 변형/테스트/보조 파일 (화면 아님 또는 비노출)

- 배치/액션: `order_count_batch.php`, `order_count_batch2.php`, `title_order_ps.php`(order/·goods/), `promotion_sales_batch.php`
- AJAX(JSON/HTML 조각): `ajax_sales_product.php`, `ajax_product_supplier.php`, `ajax_publisher_goods_item.php`, `ajax_order_goods_count.php`
- 다운로드: `order_goods_count_download.php`
- 변형: `yjs_order_goods_count.php`(order_goods_count 변형), `order_vaultn_count.php`, `order_vaultn_month_count_compare.php`
- 메뉴 비활성이나 존재: `order_retail_count.php`, `goods_ranking.php`, `order_asset_total_count.php`, `genba_publisher_count.php`, `genba_total_count.php`, `vaultn_total_count.php`, `randombox_history.php`, `randombox_report.php`, `refund_vaultn_month_count.php`, `sales_title.php`, `goods/title_order_ps.php`

## 마이그레이션 유의점

1. **집계 SQL 이식**: 대부분 화면이 raw SQL(GROUP BY + `sum()`)에 의존한다. 특히 `COALESCE(a.supplier_code,b.supplier_code)` 공급처 폴백, `directgames.tbl_publisher`(교차 DB 참조)까지 조인하는 옵션상품/공급처 통계는 결과값(총합·귀속)을 legacy와 1:1로 맞춰야 한다. is_preorder/is_promotion 3분기(예약/일반/프로모션) 분류 로직도 그대로 재현.
2. **집계 스냅샷 vs 원천**: 대부분은 사전 집계 테이블(`tbl_sales`, `tbl_sales_day`, 랭킹 테이블)을 읽지만 `sales_pg`만 원천 `tbl_order`(`step='2'`)를 직접 집계한다. 스냅샷 갱신은 "집계" 버튼(AJAX 배치)에 의존 — 배치 화면(`order_count_batch`, `promotion_sales_batch`)을 서버 액션/라우트로 이관하고 버튼→POST→reload 흐름을 유지해야 표시 데이터가 채워진다.
3. **교차 DB**: `order_count_batch.php`가 `$conn_dgkr`(dgkr DB, 연도별 아카이브 `tbl_order_YYYY`)에 접근한다. 통계 표시 화면 자체는 대부분 메인 `$conn`만 쓴다. 이관 시 dgkr 커넥션은 배치 경로에만 필요.
4. **외부 채널 마진 규칙**: Vaultn/Genba/Ztorm의 Net=Gross/1.1, 이익=Net−원가, 이익률·음수 강조는 도메인 규칙이다. **Genba 원가<300 → ×1500 환율 보정**은 눈에 띄지만 legacy 동작이므로 그대로 이식(임의 수정 금지). 미매핑 SKU "동기화" 버튼은 `/goods/{genba,vaultn}/*_catalogue_sync.php`로 연결되므로 상품 이관 범위와 협의.
5. **차트/위젯 라이브러리**: 통계 대부분은 순수 HTML 표(차트 없음). ApexCharts는 `goods_item_report`, `randombox_report`, `sales_title`에만. daterangepicker(moment 기반, 최대 90일 제한, 한국어 프리셋)는 `event_order_count`·기간형에 사용. select2 원격검색은 `order_goods_count`. 이관 시 표는 컴포넌트화, 차트는 별도 처리.
6. **엑셀 내보내기**: `order_goods_count_download.php`는 SheetJS가 아니라 `application/vnd.ms-excel` + `.xls` 헤더로 HTML `<table>`을 그대로 흘려보내는 방식. 결과 파일 포맷·파일명 규칙을 맞추려면 서버에서 동일 응답을 생성하는 편이 안전.
7. **필터 기본값/옵션 범위**: 연도 옵션 `2013 ~ 현재`, month 미지정 시 당월, day 미지정 시 당일 — 화면마다 미묘하게 다르다(예: `order_title_count`는 month 미지정 시 연간). GET 파라미터명(`search_year`/`search_month`/`search_day`/`search_start_date` 등)과 기본값 계산을 화면별로 개별 확인.
8. **권한**: 통계 화면은 공통 세션가드(`lib/lib.php`)만 확인되며 화면별 admin_level 분기는 이 범위 코드에서 확인되지 않았다(추정: 상위 lib에서 통제). 이관 시 `ADMIN-AUTHORIZATION.md` 대조 필요.
9. **성능**: 다년치 `tbl_sales`/`tbl_order` 풀스캔 GROUP BY가 많다. legacy는 최적화 대상 아님이나(behavior parity 우선), 이관 후 동일 결과 하에서 인덱스·쿼리 검토는 별도 판단.
