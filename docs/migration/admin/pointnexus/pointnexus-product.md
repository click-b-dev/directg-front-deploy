# PointNexus API - 상품 현황(판매 가능 상품)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_product.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runProduct($offset, $limit, $filters)`

## 공통 헬퍼(_inc.php) 신규 도입 (그룹 재사용)

- `pn_fmt_price($formatted, $symbol)`: 통화 기호를 금액 앞으로("58,000₩"→"₩ 58,000") → `pnFmtPrice`
- `pn_relevant_currencies`/`pn_is_relevant_currency`/`pn_filter_currencies`: KRW/JPY/USD만 표시, 나머지 "외 N개" → `PN_RELEVANT_CURRENCIES`/`pnIsRelevantCurrency`/`pnFilterCurrencies`
- `pn_pagination_cursor($page, $has_more, $base_params)`: 전체 페이지 수 불명 API용 커서 페이지네이션 → `PnCursorPagination`

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_product?mode&page&limit&filters`
- 파라미터 정규화: limit(미지정/<10 → 50, >100 → 100), page(미지정/<1 → 1). offset=(page-1)*limit.
- page_title `PointNexus 판매 가능 상품 목록` + h4 `<small>GET /product</small>`
- inline style: `.price-row`(nowrap, line-height 1.7), `.promo-price`(#f59e0b, 600), `.origin-price`(line-through #6c757d 11px), `.product-id`(monospace 12px #6c757d break-all), `.table .badge`(12px 500)
- 검색필터 카드:
  - 환경 셀렉트(autoSubmit=false)
  - 한 페이지 limit(10/50/100)
  - filters text(JSON 배열) + 사용법 `<details>`(형식/연산자/필드/예시 버튼 5개 — 클릭 시 filters input에 값 채움 + 카탈로그 링크)
  - 검색 버튼
- `has_more` = products 있고 `count(products) >= limit` (커서 방식)
- 분기:
  - `error` → alert-danger + pnExtractError
  - 정상:
    - 상단: products 있으면 "offset+1–offset+count 표시 · 현재 P 페이지 [· 마지막 페이지]", 없으면 "결과 없음" + 커서 페이지네이션
    - 11컬럼:
      1. # (offset+i+1)
      2. 상품명/장르: genericName(→ product_view 링크) + genres badges(bg-light border)
      3. 플랫폼(badge info)
      4. 퍼블리셔
      5. 타입(badge secondary)
      6. 프리오더(isPreOrder → badge warning "프리오더" / '—')
      7. 가격: `prices`에서 relevant currency만. promo면 `origin-price`(취소선 initialFormatted)+`promo-price`(priceFormatted), 아니면 priceFormatted. 숨긴 통화 "외 N개 통화". `pn_fmt_price` 적용. 없으면 '—'.
      8. 허용통화: `pn_filter_currencies` shown badges + hidden "외 N개"
      9. 판매국가: `count(allowedCountries)` + "개국"
      10. 출시일: `substr(releaseDate, 0, 10)`
      11. 상품 ID(`.product-id`)
    - empty → "표시할 상품이 없습니다." colspan=11
    - 하단 커서 페이지네이션

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/products-sale`

- 쿼리: `mode`, `page`(1), `limit`(10/50/100), `filters`(JSON 문자열)
- 백엔드 책임: runProduct(offset, limit, filters) 호출. offset=(page-1)*limit. `filters`는 그대로 API에 전달.
- 응답 `200`:
  ```
  { success: boolean,
    data?: {
      id?, genericName?, platform?, publisher?, type?, isPreOrder?: boolean,
      genres?: string[],
      prices?: { currency?, promo?: boolean, initialFormatted?, priceFormatted? }[],
      allowedCurrencies?: string[], allowedCountries?: unknown[], releaseDate?
    }[],
    count?: number,      // 응답 data 크기(전체수 아님) — has_more 판정에 사용
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_product.tsx` → `/goods/pointnexus/pointnexus_product`
- screens: `screens/pointnexus-product`
- entities: `pointnexus` 확장 — `PnProduct`/`PnPrice`/`PnProductResponse`, `pnFmtPrice`/`pnFilterCurrencies`/`PN_RELEVANT_CURRENCIES`, 공통 UI `PnCursorPagination`, `fetch/usePointNexusProducts`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/products-sale`
- 링크: product_view/catalogue 미이관 → `<a href>` 유지

## Parity 체크리스트

- [ ] limit/page 정규화·filters 통과·검색 버튼
- [ ] 커서 페이지네이션(has_more 판정)·"offset 표시"·마지막 페이지
- [ ] 11컬럼·가격 promo/relevant 통화·허용통화 필터·개국·출시일 10자
- [ ] filters 사용법 details·예시 버튼(input 채움)
