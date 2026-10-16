# PointNexus - 상품 상세 (product_view)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_product_view.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runProductRetrieve($id)` — 단건 상세
- 여러 목록(#95 상품/#97 활동로그/#98 오퍼레이션/#99 카탈로그/#101 book/#102 vcnt)의 링크 대상.

## 공통 헬퍼(_inc.php) 신규 도입

- `pn_get_lang($obj)`: 다국어 객체에서 우선순위(ko-KR,en-GB,en-US,ja-JP,zh-CN,zh-TW) 텍스트(strip_tags 후 비지 않은 것) → `pnGetLang`
- `pn_relevant_countries`/`pn_filter_countries`: KR/JP/WW/ROW만 표시, 나머지 "외 N개국" → `PN_RELEVANT_COUNTRIES`/`pnFilterCountries`

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_product_view?mode&id`
- page_title `PointNexus 상품 상세` / h4 = genericName(있으면) + `<small>GET /product/{id}</small>`
- inline style: `.product-id`, `.card-body .badge`, `.promo-price`, `.origin-price`, `.description-box`(HTML), `.section-title`, `.label-col`
- 필터: 환경(autoSubmit=false) + 상품 UUID text + 조회
- 분기: `id` 없음 → alert-info / `error` → alert-danger / `product`(배열이면[0]) → 상세 / 그 외 → alert-warning "데이터 없음"
- 상세:
  - **기본 정보** 카드(col-lg-6): 상품명/에디션(있으면)/플랫폼 badge/퍼블리셔/타입 badge/프리오더/장르(badges, 있으면)/출시일(substr 10)/최종업데이트(substr 19, T→공백)/플랫폼 SKU/퍼블리셔 SKU/Steam App ID(있으면 store.steampowered 링크)/저작권(있으면)/상품 ID
  - **가격 정보** 카드(col-lg-6): relevant 통화만 표. 통화 badge/정가(promo면 취소선 initialFormatted / 아니면 priceFormatted)/판매가(promo면 priceFormatted / 아니면 —)/프로모션(promo면 badge 문자열 또는 'ON')/판매국가(`pn_filter_countries` shown+"외 N개국"). hidden "외 N개 통화 …숨김". 없으면 "가격 정보 없음"
  - **판매 범위** 카드: 허용 통화(`pn_filter_currencies`)/판매 국가 수(count badge)/국가 목록(`pn_filter_countries`)
  - **설명** 카드(col-12): 짧은 설명(`pn_get_lang(shortDescription)`, text)/긴 설명(`pn_get_lang(longDescription)`, **HTML 그대로** description-box)
  - `PnJsonBox`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/product-retrieve`

- 쿼리: `mode`, `id`(UUID)
- 백엔드 책임: runProductRetrieve(id), 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: { id, genericName, platform, publisher, type, edition, copyright, isPreOrder,
             genres: string[], prices: (PnPrice & { allowedCountries?: string[] })[],
             allowedCurrencies: string[], allowedCountries: string[],
             releaseDate, lastUpdatedAt, platformSKU, publisherSKU, steamAppID,
             shortDescription: {lang:text}, longDescription: {lang:html} } | [...],
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_product_view.tsx` → `/goods/pointnexus/pointnexus_product_view` (mode normalize + id)
- screens: `screens/pointnexus-product-view`
- entities: `pointnexus` 확장 — `PnProductDetail`/`PnProductRetrieveResponse`, `pnGetLang`/`pnFilterCountries`/`PN_RELEVANT_COUNTRIES`, `PnPrice`에 `allowedCountries`·promo string, `fetch/usePointNexusProductRetrieve`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/product-retrieve`
- **이 화면 이관으로 #95/#97/#98/#99/#101/#102의 product_view 링크가 SPA 경로로 활성화**(각 화면은 이미 `/goods/pointnexus/pointnexus_product_view` 경로로 링크)

## Parity 체크리스트

- [ ] id 없음/error/데이터 없음 분기·h4 genericName
- [ ] 기본 정보(조건부 필드·Steam 링크)·가격표(promo·relevant 통화·국가 필터)
- [ ] 판매 범위(통화/국가 필터)·설명(다국어·긴 설명 HTML)
- [ ] JSON 박스
