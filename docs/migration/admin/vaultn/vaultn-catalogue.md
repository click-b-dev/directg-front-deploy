# Vaultn API - 카탈로그 현황

## 원본

- 파일: `pc/_Admin_/goods/vaultn/vaultn_catalogue.php` (라이브, page_title "Valutn 카탈로그 현황" 오타 유지)
- 데이터: `AdminGoods::getVaultnProductList()` (`AdminGoods.php:642`)

## 화면·플로우

- 진입 URL: `/goods/vaultn/vaultn_catalogue?page&search_product_id&search_sku&search_name`
- page_title `Valutn 카탈로그 현황`(오타) / breadcrumb: 홈 > 상품 > Vaultn 관리 > Valutn 카탈로그 현황
- **레이아웃 순서**: 페이지 타이틀 → total 개수 row → 검색필터 카드 → 목록 카드 (total이 필터 위)

### 검색필터 (method=get)

- ProductID: text `search_product_id` → `productGUID='<v>'` (정확)
- Sku: text `search_sku` → `sku='<v>'` (정확)
- title: text `search_name` → `title like '%<v>%'`
- 제출: "Valutn 상품 검색"

### 목록 (card-header "Vaultn Product")

- 10컬럼:
  1. No = `total - (num + (page-1)*30)` (역순)
  2. publisher
  3. productGUID `<br/>(sku)`
  4. title (text-start)
  5. provider
  6. regionCode
  7. srp = `number_format(srp)`
  8. purchasePrice = `number_format(purchasePrice, 2)`
  9. stock = `number_format(reservedUnits)` `<br/>(number_format(networkUnits))`
  10. 동기화날짜 = `batch_date` `<br/>(update_date)` (raw, +9h 없음)
- 페이징 **30/page**
- mutation 없음

## 데이터 (legacy)

- `getVaultnProductList`: `select * from vaultn_catalogue where sku is not null and currencyCode='KRW' <add_where> order by (reservedUnits+networkUnits) asc` · 30/page

## API 계약 (백엔드 전달)

### `GET /admin/vaultn/products`

- 쿼리: `page`(1), `search_product_id`, `search_sku`, `search_name`
- 백엔드 책임: base where(`sku is not null`, `currencyCode='KRW'`) + add_where(productGUID/sku 정확, title like), `order by (reservedUnits+networkUnits) asc`, 30/page.
- 응답 `200`:
  ```
  { items: {
      publisher, productGUID, sku, title, provider, regionCode,
      srp,             // number → number_format(srp)
      purchasePrice,   // number → number_format(purchasePrice,2)
      reservedUnits, networkUnits,  // number → stock 셀
      batch_date, update_date       // raw 문자열
    }[],
    pagination: { current_page, results_per_page: 30, total_results, total_pages }
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/vaultn/vaultn_catalogue.tsx` → `/goods/vaultn/vaultn_catalogue` (validateSearch: page + search_*)
- screens: `screens/vaultn-catalogue`
- entities: `vaultn` 확장 — `VaultnProductItem`, `VaultnProductSearch`, `VaultnProductListResponse`, `fetchVaultnProductList`, `useVaultnProductList`
- mock: `handlers/vaultn` 확장 — `GET /admin/vaultn/products`

## Parity 체크리스트

- [ ] 필터 3종(productGUID/sku 정확, title like) + base(KRW)
- [ ] 10컬럼·No 역순(30 기준)·복합 셀(productGUID(sku)/stock/동기화날짜)
- [ ] total이 필터 위, card-header "Vaultn Product"
- [ ] srp/purchasePrice 포맷, 30/page
