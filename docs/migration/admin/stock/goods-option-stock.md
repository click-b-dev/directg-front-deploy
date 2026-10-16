# 옵션상품 재고현황

## 원본
- 파일: `pc/_Admin_/goods/stock/goods_option_stock.php` (라이브) + `asset_stock_ps.php`(stock_chk/stock_chk_batch 공유) + `goods_option_stock_download.php`(xls 다운로드)
- 참조: `../legacy-project/docs/STOCK-MANAGEMENT.md`, [asset-stock](asset-stock.md)(#154 자매)
- 도메인: `AdminGoods::getGoodsOptionStockList`, `Admin::getAssetCodeList/getAssetCodeInfo/getProductStatus`

## 화면·플로우
- 진입 URL: `/goods/stock/goods_option_stock` — GET `page`, `search_key`, `search_value`, `publisherCd`, `productTypeCd`, (+ UI 없는 dead 필터 `assetTypeCd`·`platformCd`: GET로 넘어오면 백엔드가 필터, 폼엔 미노출)
- 세션/권한: `lib/lib.php` 가드. topbar `stock`, sidebar_stock.
- 화면 요소:
  - breadcrumb: 홈 / 재고 / 재고관리 / **옵션상품 재고현황**, page title 동일
  - **검색필터 카드**("옵션상품 검색필터", `bg-secondary`), GET form:
    - search_key select(`col-sm-3`): 옵션상품명(`search_name`) / 옵션상품명코드(`search_product_code`) / Asset ID(`search_asset_id`) / Asset 이름(`search_asset_name`) — 기본 `search_name`
    - search_value text(`col-sm-9`)
    - Asset 공급처 select(`select2`, name=`publisherCd`, `getAssetCodeList('PUBL')`)
    - Asset 유형 select(name=`productTypeCd`, `getAssetCodeList('PDTP')`)
    - hidden page, 제출 "옵션상품 검색"(btn-primary, **text-center**)
  - 안내문 col-12(font-12): `* 에셋 서버 실시간이 아닌 <strong>동기화된 재고</strong>입니다. [저재고 동기화]는 재고 30 미만 품목만 갱신합니다.`
  - 카운트/버튼 줄: `총 <strong id="total" text-danger>{number_format}</strong> 개`(float-start) + float-end: **저재고 동기화**(btn-danger, `me-2`) + **재고현황 다운로드**(btn-success, **publisherCd 있을 때만** 노출, data-publisher)
  - **목록 테이블**(colgroup 9열 `5/15/7/20/8/8/15/6/12%`, `table-dark` thead):
    1. 옵션상품코드 — `goods_option_view.php?product_code=` 새 탭 링크
    2. 옵션상품명 — product_name + `getProductStatus(status)` 뱃지 + **`<span class="badge bg-success font-11">`(soldout=Y면 "품절", 아니면 빈 뱃지 — legacy 그대로 항상 렌더)**
    3. Asset ID — item_id
    4. Asset 이름 — item_name (text-start)
    5. Asset 유형 — item_type
    6. Asset 플랫폼 — item_platform
    7. Asset 공급처 — item_publisher
    8. 재고 — `number_format(stock)` (text-end)
    9. 비고 — update_date + `<br/>` + **재고확인** 버튼(btn-outline-dark, data-idx=item_id)
    - 행 강조: `stock=="0" && soldout!="Y"` → `tr.table-danger`
  - ServerPagination(30/page)
- AJAX/분기:
  - **재고확인**(행): POST `asset_stock_ps.php` `{mode:stock_chk, asset_id:item_id}` → LoadingOverlay → reload
  - **저재고 동기화**: POST `{mode:stock_chk_batch, thr:30}` → reload
  - **재고현황 다운로드**: 동적 form POST → `goods_option_stock_download.php` (`publisherCd`) → xls 첨부 다운로드(공급처별 재고, `{name}_stock_{Ymd}.xls`)

## 데이터 (legacy)
- `getGoodsOptionStockList($page,$add_where,$orderby,$param,'30')`:
  `select a.product_code,a.product_name,a.soldout,a.status,b.item_id,b.item_name,b.item_type,b.item_platform,b.item_publisher,b.stock,b.update_date from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code where b.order_system='1' and a.status<>'3' {add_where} order by {orderby}`
  - 페이지가 `a.status='0'` 추가 → 실질 status='0'(판매중) 고정. orderby `stock asc, item_name asc`. **30/page**.
  - 검색 필터(search_key):
    - `search_name` → `(a.product_name like '%v%' or a.product_name_en like '%v%')`
    - `search_product_code` → `a.product_code='v'`
    - `search_asset_id` → `b.item_id='v'`
    - `search_asset_name` → `b.item_name like '%v%'`
  - 코드 필터(Cd→name, getAssetCodeInfo): `publisherCd`→`b.item_publisher` / `assetTypeCd`→`b.item_type` / `productTypeCd`→`b.asset_type` / `platformCd`→`b.item_platform`
- 다운로드(`goods_option_stock_download.php`): 동일 SELECT + `b.item_publisher='{publisher_name}'`, `stock asc,item_name asc`, xls 테이블(9열: 코드/명/AssetID/이름/형식/플랫폼/공급처/재고/업데이트).

## API 계약 (백엔드 전달)
- `GET /admin/goods/stock/goods-option` — 옵션상품 재고 목록 + 필터 코드
  - 쿼리: `page`, `search_key`, `search_value`, `publisherCd`, `productTypeCd`, `assetTypeCd`, `platformCd`
  - 응답 `200`:
    ```jsonc
    {
      "items": [
        { "product_code": "string", "product_name": "string", "soldout": "N|Y", "status": "0",
          "item_id": "string", "item_name": "string", "item_type": "string",
          "item_platform": "string", "item_publisher": "string", "stock": 0, "update_date": "YYYY-MM-DD HH:MM:SS" }
      ],
      "pagination": { "total_results": 0, "total_pages": 0 },
      "codes": {
        "publisher": [{ "code_id": "string", "name": "string" }],   // 'PUBL'
        "product_type": [{ "code_id": "string", "name": "string" }] // 'PDTP'
      }
    }
    ```
  - **백엔드 책임**: base `b.order_system='1' AND a.status<>'3' AND a.status='0'`, order `stock asc, item_name asc`, 30/page. search_key 분기·코드 Cd→name 변환(getAssetCodeInfo, `productTypeCd`→`asset_type` 매핑 주의). 관리자 세션 강제.
- `POST /admin/goods/stock/asset/check` / `POST /admin/goods/stock/asset/check-batch` — **#154와 동일 엔드포인트**(asset_stock_ps.php 공유, asset_id=item_id 기준). body `{asset_id}` / `{thr:30}`.
- `POST /admin/goods/stock/goods-option/download` — 공급처별 재고 xls. body `{publisherCd}` → `application/vnd.ms-excel` 첨부. 백엔드: item_publisher 매칭 + 동일 정렬. (프론트는 native form POST — 브라우저 다운로드)
- 에러: legacy PDOException 시 `Error!: <msg>`.

## 타겟 매핑
- 라우트: `routes/goods/stock/goods_option_stock.tsx`(search 7종)
- screens: `screens/goods-option-stock` / entities: `entities/goods-option-stock`(list+check+check-batch, dead 필터는 pass-through)
- mock: `shared/mocks/handlers/goods-option-stock.ts`(+등록). check/batch/download는 성공/무동작(정적)
- 재사용: `shared/ui/ServerPagination`+`LoadingOverlay`+`ProductStatusBadge`. soldout 뱃지는 **bg-success 인라인**(#154 dashboard의 bg-secondary와 상이 — legacy 각 화면 그대로). select2 native
- FSD: check 엔드포인트는 #154와 동일하나 entity 교차 import 금지 → goods-option-stock 슬라이스에 자체 fetcher(동일 URL) 정의

## Parity 체크리스트
- [ ] 검색키 4종·코드 드롭다운 2종·dead 필터 pass-through·선택 유지
- [ ] 9컬럼(colgroup 폭)·행 강조·soldout 빈 뱃지 quirk·status 뱃지
- [ ] 재고확인/저재고 동기화(공유 엔드포인트)·재고현황 다운로드(publisherCd 조건 노출)
- [ ] ServerPagination 30/page·엣지(빈 목록)
