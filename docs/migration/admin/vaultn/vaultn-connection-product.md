# Vaultn - Connection 상품(카탈로그 동기화) (connection_product)

## 원본

- 파일: `pc/_Admin_/goods/vaultn/vaultn_connection_product.php` (라이브), 동기화 AJAX: `vaultn_sync_batch.php`
- 데이터: `Vaultn::runConnectionProduct($connectionGuid, $page)` — connection별 상품 목록(중첩)
- #89(Vaultn 퍼블리셔/연결)의 guid 링크 대상.

## 화면·플로우

- 진입 URL: `/goods/vaultn/vaultn_connection_product?connectionGuid&page`
- page_title `Vaultn 카탈로그 동기화`(breadcrumb active) / h4 `ConnectionProduct v3 (Retrieve all products by connection)` (하드코딩)
- "총: N"(count)
- **페이지별 동기화 버튼**: `ceil(count/20)`개 — "1 동기화" … 각 버튼 → `POST vaultn_sync_batch.php {page, connectionGuid}` → `alert(data)` (reload 주석처리)
- 상품 목록(`payload`): 각 product를 세로 key-value 테이블(table-dark th)로 표시. **4단계 중첩**:
  - product: guid/title/publisher/edition/franchise/productType/skus
  - skus[]: sku/provider/regionCode/prices
  - prices[]: priceListGuid/srp/purchasePrice/priceListVAT/currencyCode/pricePoint/isActivePromotion/promotionDetails
  - promotionDetails[]: promotionGuid/promotionName/startDate/endDate/discountedSrp/discountedPurchasePrice/discountType/discount/discountCurrencyCode
- 페이징(**20/page**): «(page1) ‹(prev) [startPage..endPage] ›(next) »(last). startPage=max(1,page-5), endPage=min(totalPages, page+5). connectionGuid 유지.

## API 계약 (백엔드 전달)

### `GET /admin/vaultn/connection-products`

- 쿼리: `connectionGuid`, `page`(1, 20/page)
- 백엔드 책임: runConnectionProduct(connectionGuid, page) 원본 반환.
- 응답 `200`: `{ count, payload: [{ guid, title, publisher, edition, franchise, productType, skus: [{ sku, provider, regionCode, prices: [{ priceListGuid, srp, purchasePrice, priceListVAT, currencyCode, pricePoint, isActivePromotion, promotionDetails: [{ promotionGuid, promotionName, startDate, endDate, discountedSrp, discountedPurchasePrice, discountType, discount, discountCurrencyCode }] }] }] }] }`

### `POST /admin/vaultn/sync-batch`

- 요청: `{ connectionGuid, page }`
- 응답 `200`: `{ message: string }` — 프론트 alert.

## 타겟 매핑

- 라우트: `routes/goods/vaultn/vaultn_connection_product.tsx` → `/goods/vaultn/vaultn_connection_product`
- screens: `screens/vaultn-connection-product`
- entities: `vaultn` 확장 — `VaultnConnProduct`/`VaultnSku`/`VaultnSkuPrice`/`VaultnPromotion`/`VaultnConnectionProductResponse`, fetch/query + sync-batch mutation
- mock: `handlers/vaultn` 확장
- **#89 guid 링크 활성화**

## Parity 체크리스트

- [ ] 총 count·페이지별 동기화 버튼(alert)
- [ ] 4단계 중첩 세로 테이블
- [ ] 페이징(20/page·window ±5·connectionGuid 유지)
