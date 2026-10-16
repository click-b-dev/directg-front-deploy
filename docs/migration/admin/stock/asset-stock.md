# Asset 재고현황

## 원본
- 파일: `pc/_Admin_/goods/stock/asset_stock.php` (라이브) + `asset_stock_ps.php`(AJAX 처리, `stock_chk`/`stock_chk_batch`)
- 참조: `../legacy-project/docs/STOCK-MANAGEMENT.md`(3장 동기화·부록 B/C), `docs/legacy-admin/21-goods-stock-integration.md`
- 도메인: `Admin::getAssetList/getAssetCodeList/getAssetCodeInfo`, `Asset::runAssetItemStock/runAssetSoldOutBatch`

## 화면·플로우
- 진입 URL: `/goods/stock/asset_stock` — GET 파라미터 `page`, `asset_id`, `asset_name`, `publisherCd`, `assetTypeCd`, `productTypeCd`, `platformCd`. (`asset_id`는 대시보드/lib_func `asset_stock_link($item_id)`의 딥링크 대상 겸 필터)
- 세션/권한: `lib/lib.php` 가드. topbar `stock` active, sidebar_stock.
- 화면 요소:
  - breadcrumb: 홈 / 재고 / 재고관리 / **Asset 재고현황**, page title `Asset 재고현황`
  - **검색필터 카드**(`card-header bg-secondary text-white` "Asset 검색필터"), GET form:
    - Asset ID (text), Asset 이름 (text)
    - Asset 공급처 (`select.form-select.select2` name=`publisherCd`, "::: Asset 공급처 선택 :::" + `getAssetCodeList('PUBL')` 옵션, option value=code_id)
    - Asset 유형 (select name=`productTypeCd`, `getAssetCodeList('PDTP')`)
    - Asset 형식 (select name=`assetTypeCd`, `getAssetCodeList('ASTP')`)
    - Asset 플랫폼 (select name=`platformCd`, `getAssetCodeList('PLFM')`)
    - hidden `page`, 제출 버튼 "Asset 검색"(btn-primary, float-end)
    - 선택 상태 유지: 현재 GET값과 일치하는 option `selected`
  - 안내문 col-12: `* 에셋 서버 데이터가 아니고 동기화 된 데이터 입니다. [저재고 동기화]는 재고 30 미만 품목만 갱신합니다.`
  - 카운트 줄: `총 <strong id="total" text-danger>{number_format(total_results)}</strong> 개`(float-start) + **저재고 동기화** 버튼(float-end, `btn-danger btn-sm`, title="재고 30 미만(저재고) 품목만 에셋 서버와 동기화합니다.")
  - **목록 테이블**(`table-dark` thead, 10컬럼): Asset ID / Asset 이름 / Asset 유형(productType) / Asset 형식(assetType) / Asset 플랫폼(platform) / Asset 공급처(publisher) / 재고(재고확인 버튼 `btn-outline-dark`) / 재고수량(`number_format(stock)`, text-end) / 업데이트 일자(update_dt) / 수정(Asset 수정 버튼 `btn-outline-warning`)
  - ServerPagination(`links_html`, 30/page)
- 분기/AJAX:
  - **재고확인**(행): POST `asset_stock_ps.php` `{mode:stock_chk, asset_id}` → `LoadingOverlay(show)` → 성공 시 `location.reload()` → hide. (실패 `alert(data)`)
  - **저재고 동기화**: POST `{mode:stock_chk_batch, thr:30}` → 동일 reload 플로우
  - **Asset 수정**(행): `location.href = ../asset/asset_modify.php?asset_id=` → `/goods/asset/asset_modify?asset_id=`(미이관, 링크만)

## 데이터 (legacy)
- `getAssetList($page,$add_where,$orderby,$param)`: `select * from tbl_asset where publisher<>'EA' and is_view='Y' {add_where} order by stock asc, update_dt desc`, **30/page**(pagination 클래스, `total_results`/`links_html`/`resultset`).
  - 필터(add_where): `asset_id = '{v}'` / `asset_name like '%{v}%'` / `publisher = getAssetCodeInfo(publisherCd)` / `assetType = getAssetCodeInfo(assetTypeCd)` / `productType = getAssetCodeInfo(productTypeCd)` / `platform = getAssetCodeInfo(platformCd)` — **Cd(code_id)를 name으로 변환해 컬럼 매칭**.
- `getAssetCodeList($group_id)`: `select code_id,name from directgames.tbl_asset_code where group_id=:group_id order by name asc` (PUBL/PLFM/PDTP/ASTP).
- `getAssetCodeInfo($code_id)`: code_id → name.
- **stock_chk** (`asset_stock_ps.php`): `Asset::runAssetItemStock(asset_id)` → **`!is_null($stock)`일 때만** 트랜잭션 `tbl_asset.stock`+`tbl_goods_item_delivery.stock`(item_id=asset_id) 갱신(실패 rollback·기존값 유지). null(통신실패)이면 skip(로그 warn). 정상 품절(0)은 반영.
- **stock_chk_batch**: `$thr="30"` 하드코딩, `Asset::runAssetSoldOutBatch(30)` → `content[]`(`id`,`count`) 순회, 항목별 트랜잭션 갱신. 응답 없으면 skip.

## API 계약 (백엔드 전달)
- `GET /admin/goods/stock/asset` — Asset 재고 목록 + 필터 코드 목록
  - 쿼리: `page`(기본 1), `asset_id`, `asset_name`, `publisherCd`, `assetTypeCd`, `productTypeCd`, `platformCd`
  - 응답 `200`:
    ```jsonc
    {
      "items": [
        { "asset_id": "string", "asset_name": "string", "productType": "string",
          "assetType": "string", "platform": "string", "publisher": "string",
          "stock": 0, "update_dt": "YYYY-MM-DD HH:MM:SS" }
      ],
      "pagination": { "total_results": 0, "total_pages": 0 },
      "codes": {
        "publisher": [{ "code_id": "string", "name": "string" }],   // getAssetCodeList('PUBL')
        "product_type": [{ "code_id": "string", "name": "string" }], // 'PDTP'
        "asset_type": [{ "code_id": "string", "name": "string" }],   // 'ASTP'
        "platform": [{ "code_id": "string", "name": "string" }]      // 'PLFM'
      }
    }
    ```
  - **백엔드 책임**: base `publisher<>'EA' AND is_view='Y'`, order `stock asc, update_dt desc`, 30/page. 필터 Cd→name 변환(getAssetCodeInfo) 후 매칭. codes는 group_id별 `name asc`. 관리자 세션 강제.
- `POST /admin/goods/stock/asset/check` — 개별 재고 동기화. body `{ "asset_id": "string" }` → `200`(성공). 백엔드: Asset API `runAssetItemStock` → null 아니면 미러 2테이블 갱신, null이면 무갱신(기존 유지). 정상 품절(0) 반영.
- `POST /admin/goods/stock/asset/check-batch` — 저재고(재고<30) 일괄 동기화. body `{ "thr": 30 }`(백엔드 30 하드코딩) → `200`. 백엔드: `runAssetSoldOutBatch(30)` 반환 항목별 미러 갱신.
- 에러: legacy PDOException 시 `Error!: <msg>`. 프론트 표준 실패 처리.

## 타겟 매핑
- 라우트: `routes/goods/stock/asset_stock.tsx`(search: page/asset_id/asset_name/publisherCd/assetTypeCd/productTypeCd/platformCd)
- screens: `screens/asset-stock` / entities: `entities/asset-stock`(fetcher list+check+check-batch, queries+mutations)
- mock: `shared/mocks/handlers/asset-stock.ts`(+handlers.ts 등록). mock은 정적 목록 — check 계열은 성공 응답만(재고 실변경 없음, legacy reload는 invalidate로 재현)
- 재사용: `shared/ui/ServerPagination`, `shared/ui/LoadingOverlay`(mutation pending 표시). select2는 native select(JS 미로드, #150 선례)
- Asset 수정 링크는 `/goods/asset/asset_modify`(미이관) 문자열만

## Parity 체크리스트
- [ ] 검색필터 6필드·코드 드롭다운(4종)·선택 유지·GET 제출
- [ ] 10컬럼 목록·재고수량 number_format·update_dt·total 카운트·안내문
- [ ] 재고확인/저재고 동기화 mutation → LoadingOverlay → invalidate(=reload)
- [ ] Asset 수정 링크 경로·ServerPagination(30/page)·엣지(빈 목록)
