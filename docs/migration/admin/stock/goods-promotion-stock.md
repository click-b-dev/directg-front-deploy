# 할인 프로모션 재고현황

## 원본
- 파일: `pc/_Admin_/goods/stock/goods_promotion_stock.php` (라이브) + `asset_stock_ps.php`(stock_chk/stock_chk_batch 공유)
- 참조: [goods-option-stock](goods-option-stock.md)(#155 자매), [asset-stock](asset-stock.md)(#154)
- 도메인: `AdminGoods::getGoodsPromotionStockList`, `Admin::getAssetCodeList/getAssetCodeInfo/getProductStatus`

## 화면·플로우
- 진입 URL: `/goods/stock/goods_promotion_stock` — GET `page`, `search_key`, `search_value`, `publisherCd`, `productTypeCd`, (dead: `assetTypeCd`·`platformCd`)
- **#155와 거의 동일**. 차이만 정리:
  - page title `할인 프로모션 재고현황`, 필터 카드 헤더 `할인 프로모션 검색필터`
  - **재고현황 다운로드 버튼 없음** (저재고 동기화만)
  - **목록 행 강조 없음** (legacy `<tr>` 무조건 — #155의 `stock=0 && soldout≠Y → table-danger`가 여기엔 **없음**)
  - 데이터는 **진행중인 할인 프로모션 상품만**(promotion_schedule 조인)
- 공통(= #155): breadcrumb 홈/재고/재고관리, 검색키 4종(name/product_code/asset_id/asset_name), 코드 드롭다운 2종(publisherCd/productTypeCd, dead assetTypeCd/platformCd), 안내문, 9컬럼 colgroup(`5/15/7/20/8/8/15/6/12%`), soldout **빈 뱃지 bg-success quirk**(항상 렌더), 재고확인/저재고 동기화(asset_stock_ps.php 공유·item_id 기준), ServerPagination 30/page

## 데이터 (legacy)
- `getGoodsPromotionStockList($page,$add_where,$orderby,$param,'30')`:
  `select a.product_code,a.product_name,a.soldout,a.status,b.item_id,b.item_name,b.item_type,b.item_platform,b.item_publisher,b.stock,b.update_date from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code inner join tbl_promotion_schedule c on c.product_code=a.product_code where b.order_system='1' and a.status<>'3' and timestampdiff(second,now(),c.promotion_start)<'0' and timestampdiff(second,now(),c.promotion_end)>='0' {add_where} order by {orderby}`
  - **진행중 프로모션 조건**: `promotion_start` 이미 지남(초 차이 < 0) AND `promotion_end` 아직 안 지남(초 차이 >= 0).
  - 페이지가 `a.status='0'` 추가 → status='0' 고정. orderby `stock asc, item_name asc`. 30/page.
  - 검색 필터(search_key):
    - `search_name` → `(a.product_name like '%v%' or a.product_name_en like '%v%')`
    - `search_product_code` → `a.product_code='v'`
    - `search_asset_id` → **`b.asset_id='v'`** (표시 컬럼 item_id와 상이 — legacy 그대로)
    - `search_asset_name` → **`b.asset_name like '%v%'`** (표시 컬럼 item_name과 상이)
  - 코드 필터(Cd→name): `publisherCd`→`b.item_publisher` / `assetTypeCd`→`b.item_type` / `productTypeCd`→`b.asset_type` / `platformCd`→`b.item_platform`

## API 계약 (백엔드 전달)
- `GET /admin/goods/stock/goods-promotion` — 할인 프로모션(진행중) 재고 목록 + 필터 코드
  - 쿼리: `page`, `search_key`, `search_value`, `publisherCd`, `productTypeCd`, `assetTypeCd`, `platformCd`
  - 응답 `200` (구조는 #155와 동일):
    ```jsonc
    {
      "items": [
        { "product_code": "string", "product_name": "string", "soldout": "N|Y", "status": "0",
          "item_id": "string", "item_name": "string", "item_type": "string",
          "item_platform": "string", "item_publisher": "string", "stock": 0, "update_date": "..." }
      ],
      "pagination": { "total_results": 0, "total_pages": 0 },
      "codes": { "publisher": [{ "code_id": "string", "name": "string" }], "product_type": [ ... ] }
    }
    ```
  - **백엔드 책임**: base `b.order_system='1' AND a.status<>'3' AND a.status='0'` + **promotion_schedule 조인·진행중 조건**(promotion_start 경과 & promotion_end 미경과, now 기준). order `stock asc, item_name asc`, 30/page. search_asset_id→`b.asset_id`·search_asset_name→`b.asset_name`(표시 item_* 컬럼과 상이) 주의. 코드 Cd→name 변환. 관리자 세션 강제.
- `POST /admin/goods/stock/asset/check` / `check-batch` — **#154/#155와 동일 엔드포인트**(공유).
- 에러: legacy PDOException 시 `Error!: <msg>`.

## 타겟 매핑
- 라우트: `routes/goods/stock/goods_promotion_stock.tsx`(search 7종)
- screens: `screens/goods-promotion-stock` / entities: `entities/goods-promotion-stock`(list+check+check-batch, dead 필터 pass-through)
- mock: `shared/mocks/handlers/goods-promotion-stock.ts`(+등록). check/batch는 asset-stock 핸들러 공유(성공/무동작)
- 재사용: `shared/ui/ServerPagination`+`LoadingOverlay`+`ProductStatusBadge`. soldout 뱃지 bg-success 인라인. select2 native
- FSD: check 엔드포인트는 #154/#155와 동일하나 entity 교차 import 금지 → 자체 fetcher(동일 URL) 정의

## Parity 체크리스트
- [ ] 검색키 4종·코드 드롭다운 2종·dead 필터 pass-through·선택 유지
- [ ] 9컬럼(colgroup 폭)·**행 강조 없음**·soldout 빈 뱃지 quirk·status 뱃지
- [ ] **다운로드 버튼 없음**·저재고 동기화·재고확인(공유 엔드포인트)
- [ ] 진행중 프로모션만 표시(백엔드)·ServerPagination 30/page·엣지(빈 목록)
