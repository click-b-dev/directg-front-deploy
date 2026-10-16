# Ztorm API - 카탈로그 현황

## 원본

- 파일: `pc/_Admin_/goods/ztorm/ztorm_catalogue.php` (라이브)
- 엔티티: 기존 `ztorm` 확장. (소규모 mutation 포함해 완결)

## 화면·플로우

- 진입 URL/파라미터: `/goods/ztorm/ztorm_catalogue` (`page`만; legacy `$where` 미정의로 조건필터 없음)

- 화면 요소 (legacy 기준):
  - page_title `Ztorm 카탈로그 현황` / breadcrumb: 홈 > 상품 > Ztorm API > Ztorm 카탈로그 현황
  - 상단바: `{total} 개` + `Ztorm 상품 추가` 버튼(모달)
  - 테이블(`table-centered w-100 nowrap table-sm table-bordered border-light`, thead `table-light font-13`, tbody `font-12 bg-white`), 9컬럼:
    - 고유번호 = `ProductID` / 상품명 = `[{RegionTag}] {name}` / 공급처 = `[{publisher_id}] {publisher_name}`
    - 판매상태 = `status` / 주문가능일자 = `date(Y-m-d H:i:s, OrderDate)` / 다운로드일자 = `date(download_date)` / 출시일자 = `date(release_date)`
    - RRP = `number_format(rrp)` / 비고 = `RRP조회` 버튼(btn_rrp_search)
  - 페이지네이션(50/page)

### mutation

- **RRP조회**(btn_rrp_search): `GET ztorm_api.php {api_type:rrp_search, zt_item_id}` → alert + reload.
- **Ztorm 상품 등록**(모달, btn_ztorm_register): ProductID 입력(required) → `GET ztorm_api.php {api_type:product_add, zt_item_id}` → alert + reload.
- (btn_ppr_search 공급가조회 핸들러는 버튼 미렌더 → dead, 생략)

### base WHERE (백엔드)

- `view_flag<>'N' AND RegionTag NOT IN ('LATAM','China','CIS','ME') AND publisher_id<>'351'` — 백엔드 책임.
- orderby: `release_date desc, OrderDate desc, name desc`.
- OrderDate/download_date/release_date는 unix timestamp.

## 데이터 (legacy)

- `AdminGoods::getZtormCatalogue($page, $add_where, $orderby, $param)` — `ztorm_catalogue`, **50/page**.
- 컬럼: ProductID, RegionTag, name, publisher_id, publisher_name, status, OrderDate(unix), download_date(unix), release_date(unix), rrp.

## API 계약 (백엔드 전달)

### `GET /admin/ztorm/catalogue`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |

백엔드 책임: base WHERE + orderby.

응답: `{ items: ZtormCatalogueItem[], pagination }`

### `POST /admin/ztorm/rrp-search` — `{ zt_item_id }` → `{ success, message }` (ztorm_api rrp_search)
### `POST /admin/ztorm/products` — `{ zt_item_id }` → `{ success, message }` (ztorm_api product_add)
- 프론트: 성공 시 alert(message) + Ztorm 쿼리 invalidate.

## 타겟 매핑

- 라우트: `routes/goods/ztorm/ztorm_catalogue.tsx` → `/goods/ztorm/ztorm_catalogue`
- screens: `screens/ztorm-catalogue`
- entities: `ztorm` 확장 — `ZtormCatalogueSearch`/`ZtormCatalogueItem`/`ZtormCatalogueResponse`/`ZtormActionResult`, `fetchZtormCatalogue`/`searchZtormRrp`/`addZtormProduct`, `useZtormCatalogue`/`useSearchZtormRrp`/`useAddZtormProduct`
- shared: `shared/ui/ServerPagination`, 모달(portal fade)
- mock: `ztorm.ts` — `ZTORM_CATALOGUE_LIST` + `GET /catalogue` + `POST /rrp-search` + `POST /products`

## Parity 체크리스트

- [ ] 화면 요소 일치 (상단바/9컬럼/모달)
- [ ] 필드/포맷 일치 (date unix, RRP number_format, [RegionTag]/[publisher_id] 접두)
- [ ] 분기/플로우 일치 (RRP조회·상품추가 → alert+reload, 50/page)
- [ ] 엣지케이스 일치 (base WHERE 백엔드, ppr dead 생략)
