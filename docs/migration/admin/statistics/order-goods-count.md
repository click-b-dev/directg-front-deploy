# 옵션상품별 주문통계 (#231)

> 통계 주문 분석 4번째. 단일 옵션상품(product_code) 선택 시 판매가격별·일자별 통계 + 프로모션 이력. 원격검색 select2(상품)·연동 공급처 select2 + 엑셀 다운로드. 대형 복합 단위.

## 원본
- 파일: `pc/_Admin_/statistics/order/order_goods_count.php` + `ajax_sales_product.php`(상품 원격검색) + `ajax_product_supplier.php`(연동 공급처) + `order_goods_count_download.php`(엑셀)
- 도메인: `Admin::getSalesSupplierList`(1434), `getGoodsItemInfo`(670), `getProductPlatform`(981), `getProductStatus`
- 참조: `docs/legacy-admin/60-statistics.md`

## 화면·플로우
- **진입 URL**: `/statistics/order/order_goods_count?search_year=&search_product_code=&search_supplier_code=`
- **GET 파라미터**: `search_year`(radio all + 2020~현재, 기본 현재년), `search_product_code`(select2 원격검색), `search_supplier_code`(select2 연동).
- **page_title**: "옵션상품 주문통계" · breadcrumb: 홈 / 통계 / 주문분석 / 옵션상품 주문통계
- **year_label**: `search_year=="all" ? "전체" : "{year}년"`.
- **데이터 조건**: `search_product_code`가 있을 때만 4개 테이블 채움. 없으면 헤더만.
- **검색필터 카드**:
  - 주문연도: radio(전체 + 2020~현재, `form-check-inline`). 기본 현재년 checked.
  - 옵션상품: **select2 원격검색**(`ajax_sales_product.php`, minInputLength 0·공급처 선택 시 타이핑 전 목록·allowClear). 선택값 `[코드] 상품명 (플랫폼|미등록)`.
  - 공급처: **select2 연동**(`getSalesSupplierList` 프리로드, 상품 선택 시 `ajax_product_supplier`로 좁힘·allowClear).
  - `검 색` 버튼(GET submit, 중앙정렬).
- **결과 테이블 4종**(모두 `table table-bordered table-centered table-sm caption-top`, thead `table-light font-13`):
  1. **옵션상품정보**(caption): 8컬럼(옵션상품코드/상품명/진열그룹 display_type/플랫폼 getProductPlatform/출시일 Y-m-d/소비자가/판매가/판매상태 getProductStatus). 미등록 시(`goods_item` null): 코드 + `{selected_product_name} <span class="badge bg-secondary">미등록</span>` + colspan6 "현재 상품 등록정보가 없습니다 (판매이력만 존재)".
  2. **판매가격별 통계**(caption): `show_supplier`(공급처 미선택)면 공급처 컬럼 추가. 컬럼: [공급처]/판매가/판매수량/합계(unit_price×count). tfoot 합계(colspan `show_supplier?2:1`).
  3. **일자별 통계**(caption h5 + **엑셀 다운로드 버튼**): [공급처]/주문일자/판매가/판매수량/합계. tfoot `{year_label} 합계`(colspan `show_supplier?3:2`).
  4. **할인 프로모션 이력**(caption): 기간(promotion_start~end)/승인할인율 p_discount_rate%/DG할인율 discount_rate%/판매가 sale_price/수량 order_count/합계. tfoot `{year_label} 합계`(colspan4).
- **공급처 라벨**(price/day stats): `publisher_name ?: (old_publisher_name ? old+' <span badge bg-warning text-dark>예전DB</span>' : supplier_code)`.
- **엑셀 다운로드**: 버튼 → hidden form POST `order_goods_count_download.php` {product_code(=goods_item.product_code), supplier_code, search_year} → `.xls` 스트리밍(백엔드).
- **select2 JS 상호작용**: 상품 change → `ajax_product_supplier`(POST product_code, supplier_code) → 공급처 select 옵션 교체. 상품 비우면 전체 공급처 복원+선택해제. 공급처는 상품 원격검색 필터로도 전달.
- **세션/권한**: `lib.php` admin 가드(route-guard #2).

### legacy dead/quirk
- 25~27 `$page` dead(페이징 없음). 32~34 year_where 주석. 매출 select2 CSS(select2 취소버튼 위치)는 select2 위젯 전용 — 네이티브 구현 시 불필요.

## 데이터 (legacy)
- **DB**: `$dsn`(MAIN) PDO. `Admin` 클래스. 예전DB(`directgames.tbl_publisher`) 조인으로 구공급처명 폴백.
- **getGoodsItemInfo**(670): `select product_code,product_name,supplier_code,product_platform,release_date,status,consumer_price,price,display_type from tbl_goods_item where product_code=:pc`.
- **판매가격별**(order_price_data): tbl_sales a ⋈ tbl_goods_item b ⋈ tbl_publisher c ⋈ directgames.tbl_publisher d, `where a.product_code=:pc [+공급처 COALESCE(a.supplier_code,b.supplier_code)=:sc] [+연도 a.ord_ymd between]` group by supplier, unit_price. order by publisher asc, unit_price asc.
- **일자별**(order_day_data): 위와 동일 + ord_ymd group/order.
- **프로모션 이력**: `select * from tbl_promotion_schedule where product_code=:pc [+promotion_start>=start and promotion_end<=end]`.
- **getSalesSupplierList**(1434): tbl_goods_item(status∈0,1,9) ∪ tbl_sales의 supplier_code distinct → publisher_name(현재/예전DB '예전DB' 접미/코드) order by name.
- **ajax_sales_product**: q(코드/상품명 like)/supplier_code 필터 → 등록상품(tbl_goods_item, 상위30) + 미등록(tbl_sales prefix, 남은자리) → `{results:[{id:product_code, text:"[코드] 상품명 (플랫폼|미등록)"}]}`. q 없고 supplier만 있으면 해당 공급처 판매상품 상위100.
- **ajax_product_supplier**: 해당 상품 판매 공급처 목록(예전DB 폴백) → option HTML(JSON으로 변환).

## API 계약 (백엔드 전달)

### `GET /admin/statistics/order/goods-count`
- 요청: `search_year`(YYYY|all), `search_product_code`(있을 때만 데이터), `search_supplier_code`(옵션).
- 응답:
  ```ts
  type StatGoodsSupplierRow = { supplier_code: string; publisher_name: string; old_publisher_name: string };
  type StatGoodsPriceRow = StatGoodsSupplierRow & { unit_price: number; total_count: number };
  type StatGoodsDayRow = StatGoodsSupplierRow & { ord_ymd: string; unit_price: number; total_count: number };
  type StatGoodsPromotionRow = { promotion_start: string; promotion_end: string; p_discount_rate: string; discount_rate: string; sale_price: number; order_count: number };
  type StatGoodsItemInfo = { product_code: string; product_name: string; display_type: string; platform_name: string; release_date: string; consumer_price: number; price: number; status: string } | null;
  type StatOrderGoodsCountResponse = {
    search_year: string; search_product_code: string; search_supplier_code: string;
    year_label: string; show_supplier: boolean;
    goods_item: StatGoodsItemInfo; selected_product_name: string;
    price_stats: StatGoodsPriceRow[]; day_stats: StatGoodsDayRow[]; promotion_history: StatGoodsPromotionRow[];
  };
  ```
- 백엔드 책임: 기간/공급처 where 조합, COALESCE 공급처+예전DB 폴백, getProductPlatform → platform_name, 정렬. 합계는 프론트 계산.

### 보조 엔드포인트
- `GET /admin/statistics/order/goods-count/suppliers` → `{ suppliers: {publisher_code, publisher_name}[] }` (getSalesSupplierList 프리로드).
- `GET /admin/statistics/order/goods-count/products?q=&supplier_code=` → `{ results: {id, text}[] }` (select2 원격검색).
- `GET /admin/statistics/order/goods-count/product-suppliers?product_code=&supplier_code=` → `{ suppliers: {supplier_code, label, selected}[] }` (연동 공급처, legacy option HTML→JSON).
- 엑셀: `POST {apiBaseUrl}/admin/statistics/order/goods-count/download` {product_code, supplier_code, search_year} → `.xls` 스트리밍(백엔드, 바이너리 mock 불가·native form POST).

## 타겟 매핑
- 라우트: `routes/statistics/order/order_goods_count.tsx` → `/statistics/order/order_goods_count`
- 스크린: `screens/statistics-order-goods-count` (원격검색 combobox·연동 공급처 select·4테이블·엑셀 form POST 로컬 구현)
- 엔티티: `entities/statistics` 확장(goods-count fetch/query + suppliers + products search + product-suppliers)
- mock: `handlers/statistics.ts` 확장(main + suppliers + products + product-suppliers)
- 공용 재사용: `shared/ui/ProductStatusBadge`(getProductStatus)

## Parity 체크리스트
- [ ] 연도 radio(전체+2020~현재·기본 현재년)·상품 원격검색·연동 공급처·검색
- [ ] 상품 미선택 시 4테이블 헤더만
- [ ] 옵션상품정보(등록/미등록 분기)·판매가격별(show_supplier 컬럼)·일자별(+엑셀)·프로모션 이력
- [ ] 공급처 라벨(예전DB badge)·tfoot 합계·year_label
- [ ] 상품 change→공급처 연동·상품 비움→전체복원
- [ ] 엑셀 다운로드 form POST(백엔드)
- [ ] page_title "옵션상품 주문통계"
