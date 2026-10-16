# PointNexus - 카탈로그 (DB) 조회

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_catalogue.php` (라이브), 공통 `_inc.php`
- **DB 직접 조회** — PointNexus API가 아니라 `pointnexus_catalogue` 테이블 + `tbl_goods_item_delivery`/`tbl_goods_item` 조인. 삭제 처리(PRG) 포함.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_catalogue?mode&keyword&publisher&platform&preorder&mapping&stale&page&limit`
- 파라미터 정규화: limit(미지정/<10 → 50, >200 → 200), page(<1 → 1). offset=(page-1)*limit.
- page_title `PointNexus 카탈로그 (DB)` + h4 `<small>pointnexus_catalogue 테이블 조회</small>`
- inline style: `.product-id`, `.table .badge`, `.price-row`, `.origin-price`, `.promo-price`, `.mapped-list`(.mapped-item/.code), `.col-action`
- 검색필터 카드:
  - 환경(`PnModeSelect` **autoSubmit=true**)
  - 퍼블리셔(select, DB distinct)/플랫폼(select, DB distinct)
  - 프리오더(전체/Y프리오더만/N일반만)
  - 매핑(전체/Y매핑됨/N미매핑)
  - 키워드(text: genericName/productID/publisher LIKE)
  - 단종(전체/Y단종의심/N정상)
  - 한페이지(50/100/200)
  - 검색 버튼
- **단종 의심**: `update_date < MAX(update_date of mode)` → 마지막 동기화에 누락된 상품
- **매핑**: `tbl_goods_item_delivery.order_system='10'` EXISTS
- 삭제(PRG): 매핑된 상품(order_system='10' 존재)은 삭제 차단(warning) → flash. 미매핑만 삭제 가능.
- 페이지네이션: `pn_pagination_html`(페이지 기반, total_pages)
- 분기: `error` → alert-danger. 정상: "총 N건 · offset+1–offset+count 표시 · page/total_pages 페이지" + 페이지네이션
- 10컬럼:
  1. #
  2. 상품명(genericName + 단종의심 badge) + productID
  3. 플랫폼(badge info)
  4. 퍼블리셔
  5. 타입(badge secondary)
  6. 프리오더(badge warning/—)
  7. 가격(KRW): prices JSON에서 currency=KRW 찾아, promo면 정가(취소선 initialFormatted)+프로모션가(priceFormatted)+프로모션 badge, 아니면 정가(initialFormatted). `pn_fmt_price`. 없으면 '—'
  8. 출시일(substr 10)
  9. 매핑 자사상품: 매핑됨이면 (단종+매핑 시 경고) 각 mapped_code(매핑 badge + code 링크 goods_option_view + name) / 미매핑 badge
  10. 관리: "매핑 관리" 버튼(→catalogue_map) + 미매핑이면 "삭제"(confirm→mutation)
- empty → "표시할 상품이 없습니다." colspan=10
- flash(삭제 결과) 알림(dismissible)

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/catalogue`

- 쿼리: `mode`, `keyword`, `publisher`, `platform`, `preorder`(''|Y|N), `mapping`(''|Y|N), `stale`(''|Y|N), `page`, `limit`(50/100/200)
- 백엔드 책임: `pointnexus_catalogue`(mode 한정) 필터 + `tbl_goods_item_delivery`(order_system='10') 매핑 LEFT JOIN 집계, genericName ASC, LIMIT/OFFSET. 단종여부(update_date<MAX)·매핑코드/명 서버 계산. publisher/platform distinct 옵션.
- 응답 `200`:
  ```
  { items: {
      productID, genericName, edition, platform, publisher, type, isPreOrder,
      releaseDate, prices: PnPrice[], lastUpdatedAt, update_date,
      mappedCodes: string[], mappedNames: string[], isDiscontinued: boolean
    }[],
    total: number,
    publisher_list: string[],
    platform_list: string[]
  }
  ```

### `POST /admin/pointnexus/catalogue/delete`

- 요청: `{ productID, mode }`
- 백엔드 책임: 매핑(order_system='10') 존재 시 삭제 차단, 없으면 `DELETE ... WHERE productID AND mode`.
- 응답 `200`: `{ success: boolean, message: string, flash_type: "success"|"warning" }`
- 성공/차단 후 프론트는 flash 표시 + 목록 재조회.

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_catalogue.tsx` → `/goods/pointnexus/pointnexus_catalogue`
- screens: `screens/pointnexus-catalogue`
- entities: `pointnexus` 확장 — `PnCatalogueItem`/`PnCatalogueResponse`/`PnCatalogueDeleteResult`, 공통 UI `PnPagination`(페이지 기반), `fetch/usePointNexusCatalogue`, `deletePointNexusCatalogue`/`useDeletePointNexusCatalogue`
- mock: `handlers/pointnexus` 확장 — catalogue GET + delete POST
- 링크: catalogue_map/goods_option_view 미이관 → `<a href>`

## Parity 체크리스트

- [ ] 필터 8종(환경 autoSubmit)·limit/page 정규화
- [ ] 페이지 페이지네이션(총 N건·표시·page/total)
- [ ] 10컬럼·단종의심·가격 KRW promo·매핑 목록·프리오더
- [ ] 매핑 관리 링크·미매핑 삭제(confirm→차단/성공 flash)·재조회
