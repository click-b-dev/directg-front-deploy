# PointNexus - 카탈로그 매핑 (catalogue_map)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_catalogue_map.php` (화면), `_ps.php` (map/unmap/search)
- **DB 직접**: `pointnexus_catalogue` 조회 + `tbl_goods_item_delivery`(order_system='10') 매핑 + `tbl_goods_item` 검색
- #99(카탈로그)의 "매핑 관리" 링크 대상.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_catalogue_map?mode&productID`
- **productID 없으면 catalogue로 redirect**(legacy `header Location`)
- page_title `PointNexus 카탈로그 매핑` + h4 `<small>PointNexus 상품 ↔ 자사 옵션상품 연결</small>`
- inline style: `.product-id`, `.info-table`, `.table .badge`
- flash / db_error 알림
- **PointNexus 상품 정보** 카드(col-md-6): pn_info 있으면 단종 의심 alert(있을 때) + info-table(productID+단종 badge/상품명/edition/플랫폼 badge/퍼블리셔/타입 badge/프리오더/출시일 substr10/mode/마지막 동기화(+단종이면 최신회차 누락)). 없으면 "찾을 수 없습니다"
- **현재 매핑** 카드(col-md-6, N건): mapped_list 없으면 "매핑된 자사 상품이 없습니다". 있으면 표(product_code/상품명/플랫폼 표시명/해제 버튼→unmap)
- **자사 상품 검색 후 매핑** 카드: 키워드 input + 검색 버튼(Enter 지원) → search → 모달
- 검색 모달(modal-lg): 결과 표(product_code/상품명/플랫폼/옵션타입/상태 badge/매핑) — already면 "매핑됨" badge, 아니면 "매핑" 버튼→map
- "카탈로그 목록으로" 버튼
- status badge: 0=판매중(success), 1=판매중지(warning), 3=삭제(secondary), 9=승인대기(info), else light

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/catalogue-map`

- 쿼리: `mode`, `productID`
- 응답 `200`:
  ```
  { pn_info: { productID, genericName, edition, platform, publisher, type, isPreOrder, releaseDate, mode, update_date } | null,
    is_discontinued: boolean, max_update: string|null,
    mapped_list: { product_code, product_name, product_platform_label, ... }[]
  }
  ```

### `POST /admin/pointnexus/catalogue-map/search`

- 요청: `{ keyword, productID, mode }`
- 백엔드 책임: `tbl_goods_item` product_code/product_name LIKE(100건), 이미 매핑된 코드 표시.
- 응답 `200`: `{ items: { product_code, product_name, product_platform_label, option_type, status, already: boolean }[] }`

### `POST /admin/pointnexus/catalogue-map/action`

- 요청: `{ action: "map"|"unmap", product_code, productID, mode }`
- 백엔드 책임: map(중복 체크 후 `setGoodsOptionDeliveryItem`) / unmap(DELETE order_system='10').
- 응답 `200`: `{ success: boolean, message: string, flash_type: string }`
- 성공 후 프론트는 flash + catalogue-map 재조회 (map은 모달 닫기).

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_catalogue_map.tsx` → `/goods/pointnexus/pointnexus_catalogue_map` (mode normalize + productID, 없으면 redirect)
- screens: `screens/pointnexus-catalogue-map`
- entities: `pointnexus` 확장 — `PnCatalogueMapInfo`/`PnCatalogueMapSearchItem`/`PnCatalogueMapActionResult`, `fetch/usePointNexusCatalogueMap`, `searchPointNexusCatalogueMapItems`, `runPointNexusCatalogueMapAction`/`use...`
- mock: `handlers/pointnexus` 확장 — map GET + search POST + action POST
- 검색 모달: Bootstrap JS 없음 → `createPortal` fade 재현
- **#99 매핑 관리 링크 활성화**

## Parity 체크리스트

- [ ] productID 없으면 redirect·flash/db_error
- [ ] 상품 정보(단종 의심)·현재 매핑(해제)·검색 모달(매핑/매핑됨)
- [ ] map/unmap/search mutation·status badge·재조회
