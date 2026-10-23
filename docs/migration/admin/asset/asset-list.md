# Asset 현황 (Asset 서버 관리 API)

## 원본

- 파일: `pc/_Admin_/goods/asset/asset_list.php` (라이브) + `asset_ps.php`(asset_list/asset_search/assets_delete/asset_inventory_qty/asset_item_register)
- 참조: `../legacy-project/docs/STOCK-MANAGEMENT.md`(부록 B/E), `docs/legacy-admin/21-goods-stock-integration.md`
- 도메인: `Asset::runAssetList/runAssetDetail/runAssetDelete/runAssetItemRegister`, `Admin::getAssetCodeList/getAssetInfo/getAssetCodeInfo`
- **영역**: 사이드바 "Asset 서버 관리(API)" 그룹 1번째. **실시간 Asset 서버 API 데이터**(동기화 DB 아님).

## 화면·플로우

- 진입 URL: `/goods/asset/asset_list` — GET `page`, `searchValue`(Asset 이름), `searchID`(Asset ID·이름보다 우선), `publisherCd`, `productTypeCd`, `assetTypeCd`, `platformCd`
- 세션/권한: `lib/lib.php` 가드. topbar `stock`, sidebar_stock. mutation은 `$_SESSION['admin']` 필요(백엔드).
- breadcrumb: 홈 / 재고 / Asset 관리 / **Asset 현황**, page title 동일
- **검색필터 카드**("Asset 검색필터"): Asset 이름(text searchValue) / Asset ID(text searchID + `※ AssetID를 이름보다 우선검색` text-danger) / 공급처·유형·형식·플랫폼 select 4종 / 제출 "Asset 검색"(float-end)
- 안내문: `* 동기화 DB가 아닌 <strong>에셋 서버 실시간(API)</strong> 데이터입니다. 재고 수량은 [재고 관리(DB) > Asset 재고현황]에서 확인하세요.`(text-muted)
- 카운트: `총 <strong id="total" text-danger>{n}</strong> 개`(AJAX totalElements로 채움)
- **목록**(card>card-body p-0, `table-dark` thead, 11컬럼, 헤더 인라인 width%·`<br/>` 2줄): Asset ID / Asset 이름(eng span) / 유형(productType) / 형식(assetType) / 플랫폼(eng) / 공급처(eng) / **Asset 수정**(btn-outline-warning→asset_modify) / **Asset 삭제**(btn-outline-danger) / **키 사용현황**(btn-outline-info→asset_item_list) / **키 등록**(btn-outline-warning→모달) / **기초정보 등록**(is_registered면 "등록완료" 텍스트, else btn-outline-dark)
- 페이징: **renderPaging**(admin 공통 AJAX 페이저 → `shared/ui/Pagination`, baseUrl `asset_list.php`+params, size=30) — URL 네비게이션
- **키 등록 모달**(#exampleModal): 제목=Asset title / Asset ID(readonly) / Asset 키(textarea rows20 required) / "키 등록" 버튼. Bootstrap JS 미로드 → **React 제어 모달**(#142 선례).
- 데이터 로딩: `$(ready)` → `getAssetList(...)` AJAX(POST asset_ps.php). searchID>0이면 mode=`asset_search`(단건 상세) else `asset_list`. 검색 제출 시 page=1 리셋.

## 액션(AJAX, asset_ps.php)

- **목록**: `asset_list`(runAssetList → content[]·totalElements·totalPages, 각 행 `is_registered`=getAssetInfo 존재여부) / `asset_search`(runAssetDetail 단건, 유효 id면 1건 else 0건)
- **Asset 수정**: `location.href=asset_modify.php?asset_id=`(별도 화면·미이관→링크만)
- **키 사용현황**: `location.href=asset_item_list.php?asset_id=`(별도 화면·미이관→링크만)
- **Asset 삭제**: `confirm("삭제하시겠습니까?")` → mode=`assets_delete`{asset_id} → `alert(message)` → reload (하위 Item 존재 시 삭제 거부 가능)
- **키 등록**(모달): mode=`asset_item_register`{asset_id, asset_item} → `count`(int) 반환 → `count>0`이면 `alert(count+"개 등록 완료")`, else `alert("등록오류...")`. **등록 후 모달 유지(새로고침 없음)**·다른 Asset로 열 때 textarea 초기화
- **기초정보 등록**: mode=`asset_inventory_qty`{asset_id, reg_date} → tbl_asset upsert(재고 미러 기초행) → reload

## 데이터 (legacy)

- `runAssetList($page,$size,$title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd)`: 외부 API. content 각 항목 `id,title,productType,assetType,platform,publisher,regDt`. `is_registered`는 `getAssetInfo(id)` 로컬 존재여부(PHP 후처리 추가).
- `runAssetDetail($asset_id)`: 단건 상세(searchID 검색). 이름 필드 `title`(name 폴백).
- size **30**. 코드 목록 4종 `getAssetCodeList('PUBL'|'PLFM'|'PDTP'|'ASTP')`(페이지 렌더 시 서버 조회).
- 삭제 `runAssetDelete`(하위 Item 존재 시 거부 message), 키등록 `runAssetItemRegister`→count, 기초정보 `asset_inventory_qty`→tbl_asset upsert(코드→이름 변환).

## API 계약 (백엔드 전달)

- `GET /admin/goods/asset` — Asset 실시간 목록(+검색·코드)
  - 쿼리: `page`, `searchValue`, `searchID`, `publisherCd`, `productTypeCd`, `assetTypeCd`, `platformCd`
  - **백엔드**: `searchID` 있으면 단건 상세(runAssetDetail, 유효 id면 1건/else 0건) else runAssetList(30/page). 각 content에 `is_registered`(로컬 tbl_asset 존재여부). 코드→이름 변환은 API 서버 파라미터 규약 준수. 관리자 세션.
  - 응답 `200`:
    ```jsonc
    {
      "content": [
        {
          "id": "string",
          "title": "string",
          "productType": "string",
          "assetType": "string",
          "platform": "string",
          "publisher": "string",
          "is_registered": false,
          "regDt": "string",
        },
      ],
      "totalElements": 0,
      "totalPages": 0,
      "codes": {
        "publisher": [{ "code_id": "string", "name": "string" }], // 'PUBL'
        "product_type": [{ "code_id": "string", "name": "string" }], // 'PDTP'
        "asset_type": [{ "code_id": "string", "name": "string" }], // 'ASTP'
        "platform": [{ "code_id": "string", "name": "string" }], // 'PLFM'
      },
    }
    ```
- `POST /admin/goods/asset/delete` — body `{asset_id}` → `{ "message": "string" }`(하위 Item 존재 시 거부 메시지). 관리자 세션 강제.
- `POST /admin/goods/asset/keys` — body `{asset_id, asset_item}` → `{ "count": 0 }`(등록된 키 수). 관리자 세션.
- `POST /admin/goods/asset/inventory` — body `{asset_id, reg_date}` → `200`(tbl_asset 기초행 upsert). 관리자 세션.
- 에러: legacy는 `msg()`/`alert`/PDOException. 프론트 표준 처리.

## 타겟 매핑

- 라우트: `routes/goods/asset/asset_list.tsx`(search 7종)
- screens: `screens/asset-list`(신규, #16 title-list와 다름) / entities: `entities/asset`(신규 슬라이스 — Asset 서버관리 6화면 공유, 이번엔 list+delete+keys+inventory)
- mock: `shared/mocks/handlers/asset.ts`(+등록). delete/keys/inventory는 성공/무동작(정적)
- 재사용: `shared/ui/Pagination`(renderPaging). 모달은 React 제어(BS JS 미로드). Asset 수정/키사용현황은 미이관 링크(`/goods/asset/asset_modify`·`/goods/asset/asset_item_list`)
- eng/num span 클래스 유지·헤더 인라인 width·2줄 헤더 그대로

## Parity 체크리스트

- [ ] 검색필터 6종(searchID 우선 안내)·코드 드롭다운 4종·선택 유지·제출 page=1
- [ ] 11컬럼·eng span·is_registered 분기(등록완료/기초정보등록)·2줄 헤더
- [ ] 삭제(confirm→alert→reload)·키등록 모달(count alert·모달 유지·textarea 초기화)·기초정보등록(reload)
- [ ] Pagination(30/page·URL)·Asset 수정/키사용현황 링크·엣지(빈 목록·searchID 0건)

## 실서버 연동 (swagger — 2026-10-23)

- `GET /api/admin/assets` (ADMIN) — 쿼리: `page`(1)·`size`(30)·`assetId`·`name`·`productTypeCd`·`assetTypeCd`·`platformCd`·`publisherCd`. 응답 `content`: `{content:[{id(int64),title,productType,assetType,platform,publisher,regDt,isRegistered}], totalElements, totalPages}`.
- 프론트 변환: `searchID→assetId`, `searchValue→name`, `id→string`, `isRegistered→is_registered`. 필터 드롭다운 `codes`는 `GET /api/codes`에서 조립(별도 필드 없음).
- **미등록(여전히 mock)**: 삭제·기초정보 등록·키 등록(`/admin/goods/asset/{delete,inventory,keys}`) — swagger에 없음.
- 에러 문구: 400(`BAD_REQUEST`)→"검색 조건을 확인해 주세요.", 401은 세션 파기 후 `/login`. API별 문구는 `entities/asset/lib/error-messages.ts`.
