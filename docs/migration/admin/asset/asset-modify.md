# Asset 수정 (Asset 서버 관리 API 서브)

## 원본
- 파일: `pc/_Admin_/goods/asset/asset_modify.php` (수정 폼) + `asset_ps.php`(mode=asset_modify)
- 진입: asset_list(#160) "Asset 수정" 버튼(`asset_modify.php?asset_id=`)
- 참조: [asset-list](asset-list.md)(#160), [asset-register](asset-register.md)(#161)
- 도메인: `Asset::runAssetDetail/runAssetModify`, `Admin::getAssetCodeList/getAssetCode`

## 화면·플로우
- 진입 URL: `/goods/asset/asset_modify?asset_id=` — asset_id 필수
- **진입 검증**: asset_id 없으면 `msg("잘못된 접근입니다. (asset_id 없음)", "asset_list.php")`. **runAssetDetail 결과 없거나 id 없으면** `msg("Asset 서버에서 정보를 불러오지 못했습니다.", "asset_list.php")` → 목록 리다이렉트.
- breadcrumb: 홈 / 재고 / Asset 관리 / **Asset 수정**, page title 동일
- **폼**(col-6 card, form-horizontal, POST asset_ps.php):
  - `* Asset ID`(asset_id, text, **readonly**, GET값)
  - `* Asset 명`(asset_name, text, **required**, API 상세 title 프리필)
  - `Asset 유형`(productTypeCd select, PDTP, **required 아님**, 프리셀렉트) / `Asset 형식`(assetTypeCd, ASTP) / `Asset 플랫폼`(platformCd, PLFM) / `Asset 공급처`(publisherCd, PUBL) — 각 label `bg-light`
  - 제출 "Asset 저장"(btn-primary, text-end)
- **프리필(중요)**: 값은 **로컬 DB 아닌 Asset 서버 API(runAssetDetail)**에서 조회(stale/미동기화 방지). 이름=title(name 폴백). 코드 select는 API 코드명(이름)을 `getAssetCode(group,name)`로 **code_id 역매핑**해 프리셀렉트.
- 처리(mode=asset_modify): 세션 admin 없으면 로그인 필요. `runAssetModify(asset_id,title,productTypeCd,assetTypeCd,platformCd,publisherCd,admin_id)` → API 성공(id) 시 로컬 tbl_asset 동기화(코드→이름) 후 `msg("Asset 수정 완료", "asset_list.php")`(목록 이동) / API 실패(id 없음) `msg("Asset 수정 실패: {message}", -1)`(로컬 미변경).

## API 계약 (백엔드 전달)
- `GET /admin/goods/asset/detail` — 수정 폼 프리필(실시간 API 상세)
  - 쿼리: `asset_id`
  - 응답: 성공 `{ "asset_id": "string", "asset_name": "string", "productTypeCd": "string", "assetTypeCd": "string", "platformCd": "string", "publisherCd": "string", "found": true }` / 조회 실패 `{ "found": false }`
  - **백엔드**: runAssetDetail → title(name 폴백)·코드명 code_id 역매핑(getAssetCode). 관리자 세션.
- `POST /admin/goods/asset/modify` — Asset 수정
  - body: `{ asset_id, asset_name, productTypeCd, assetTypeCd, platformCd, publisherCd }`
  - 응답: 성공 `{ id }` / 실패 `{ message }`
  - **백엔드**: 관리자 세션. API 우선 수정 후 성공 시 로컬 tbl_asset 동기화(코드→이름). 실패 시 로컬 미변경.
- 드롭다운 코드: 기존 `GET /admin/goods/asset/codes`(#161) 재사용.
- 에러: legacy `msg()`.

## 타겟 매핑
- 라우트: `routes/goods/asset/asset_modify.tsx`(search: asset_id)
- screens: `screens/asset-modify` / entities: `entities/asset` 확장(`fetchAssetDetail`/`useAssetDetail`, `modifyAsset`/`useModifyAsset`, `useAssetCodes` 재사용)
- mock: `shared/mocks/handlers/asset.ts` 확장(detail GET, modify POST)
- 폼: 프리필(detail)+드롭다운(codes)·asset_name required·성공 alert+`/goods/asset/asset_list`(window.location)·실패 alert·진입 검증 시 alert+리다이렉트

## Parity 체크리스트
- [ ] asset_id 없음/조회 실패 → alert + asset_list 리다이렉트
- [ ] asset_id readonly·asset_name 프리필 required·코드 4종 프리셀렉트(required 아님)
- [ ] 성공 "Asset 수정 완료" alert + 목록 이동 / 실패 "Asset 수정 실패: {message}" alert
- [ ] 값은 API 상세 기준(로컬 아님)·label bg-light
