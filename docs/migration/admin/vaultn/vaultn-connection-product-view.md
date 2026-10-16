# Vaultn - 연동상품 상세 (connection_product_view)

## 원본
- 파일: `pc/_Admin_/goods/vaultn/valutn_connection_product_view.php` (라이브, 파일명 "valutn" 오타)
- 데이터: `Vaultn::runConnectionProductRetrieve($connectionGuid, $productGUID)`

## 화면·플로우
- 진입 URL: `/goods/vaultn/valutn_connection_product_view?connectionGuid&productGUID` (직접 URL 접근, 사이드바 외)
- page_title `Valutn 상품 조회`(breadcrumb active) / h4 `ConnectionProduct (Retrieve all products by connection)`
- 세로 key-value 테이블: guid/title/publisher/edition/franchise/productType + `regions` 행에 중첩 테이블
- regions 중첩 테이블 컬럼: RegionCode(code) / keyProvider(skus[0].keyProvider) / sku(skus[0].sku) / prices(`<ol>` countryCode/currencyCode/amount/purchasePrice) / agreements(print_r 덤프) / country(regionCountries `<ol>` countryCode/countryName) / salesCountries(`<ol>` countryCode/countryName)

## API 계약 (백엔드 전달)
### `GET /admin/vaultn/connection-product-view`
- 쿼리: `connectionGuid`, `productGUID`
- 응답 `200`: `{ guid, title, publisher, edition, franchise, productType, regions: [{ code, skus: [{ keyProvider, sku }], prices: [{ countryCode, currencyCode, amount, purchasePrice }], agreements, regionCountries: [{ countryCode, countryName }], salesCountries: [{ countryCode, countryName }] }] }`
- 백엔드 책임: runConnectionProductRetrieve 원본 반환. `agreements`는 임의 구조(프론트는 JSON 덤프).

## 타겟 매핑
- 라우트: `routes/goods/vaultn/valutn_connection_product_view.tsx`
- screens: `vaultn-connection-product-view` / entities: `vaultn`(retrieve) / mock: `handlers/vaultn`

## Parity 체크리스트
- [ ] 상단 6개 key-value 행 · regions 중첩 7컬럼
- [ ] prices/regionCountries/salesCountries `<ol>` 조인 형식 · agreements 덤프
