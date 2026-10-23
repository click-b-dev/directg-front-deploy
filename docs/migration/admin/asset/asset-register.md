# Asset 등록 (Asset 서버 관리 API)

## 원본

- 파일: `pc/_Admin_/goods/asset/asset_register.php` (등록 전용 폼) + `asset_ps.php`(mode=`asset_register`)
- 참조: [asset-list](asset-list.md)(#160), `docs/legacy-admin/21-goods-stock-integration.md`
- 도메인: `Asset::runAssetRegister`, `Admin::getAssetCodeList`

## 화면·플로우

- 진입 URL: `/goods/asset/asset_register` (파라미터 없음)
- 세션/권한: `lib/lib.php` 가드. topbar `stock`, sidebar_stock. 등록은 `$_SESSION['admin']` 필요(백엔드).
- breadcrumb: 홈 / 재고 / Asset 관리 / **Asset 등록**, page title 동일
- **폼**(col-6 card, form-horizontal, label col-3 / 입력 col-9, POST asset_ps.php):
  - `*Asset 명`(asset_name, text, **required**)
  - `*Asset 유형`(productTypeCd, select PDTP, **required**)
  - `*Asset 형식`(assetTypeCd, select ASTP, **required**)
  - `*Asset 플랫폼`(platformCd, select PLFM, **required**)
  - `Asset 공급처`(publisherCd, select PUBL, **선택**)
  - 제출 "Asset 등록"(btn-primary, text-end)
- 처리(mode=asset_register): 세션 admin 없으면 `msg("로그인이 필요합니다.", -1)`. `runAssetRegister(name,productTypeCd,assetTypeCd,platformCd,publisherCd,admin_id)` →
  - `res->id` 있으면 **`msg("Asset 등록 완료 (ID: {id})", "asset_list.php")`**(성공 → 목록 이동)
  - 없으면 **`msg("Asset 등록 실패: {res->message or 기본문구}", -1)`**(실패 → alert 후 이전 폼 유지)
  - `msg(text, url)`: `alert(text)` 후 `url==-1`이면 `history.back()`, 아니면 `location.href=url`.

## 데이터 (legacy)

- `getAssetCodeList('PUBL'|'PLFM'|'PDTP'|'ASTP')` — 드롭다운(페이지 렌더 시 서버 조회).
- `runAssetRegister(title,productTypeCd,assetTypeCd,platformCd,publisherCd,admin_id)` — 외부 Asset API 등록. 성공 응답 `id`, 실패 `message`(이름 중복·필수값 누락 등).

## API 계약 (백엔드 전달)

- `GET /admin/goods/asset/codes` — 등록/수정 폼 드롭다운 코드 4종
  - 응답 `200`: `{ "publisher": [{code_id,name}], "product_type": [...], "asset_type": [...], "platform": [...] }`
- `POST /admin/goods/asset/register` — Asset 등록
  - body: `{ asset_name, productTypeCd, assetTypeCd, platformCd, publisherCd }`(publisherCd 선택)
  - 응답 `200`: 성공 `{ "id": "string" }` / 실패 `{ "message": "string" }`(이름 중복 또는 필수값 누락)
  - **백엔드**: 관리자 세션 강제(없으면 로그인 필요). Cd→Asset API 파라미터 규약 준수. title 유일성 검증.
- 에러: legacy `msg()`/PDOException.

## 타겟 매핑

- 라우트: `routes/goods/asset/asset_register.tsx`(파라미터 없음)
- screens: `screens/asset-register` / entities: `entities/asset` 확장(`fetchAssetCodes`/`useAssetCodes`, `createAsset`/`useCreateAsset`)
- mock: `shared/mocks/handlers/asset.ts` 확장(`/admin/goods/asset/codes` GET, `/admin/goods/asset/register` POST)
- 폼: HTML5 `required` 유지(브라우저 검증) + onSubmit → mutation. 성공 시 `alert` 후 `/goods/asset/asset_list` navigate, 실패 시 `alert(message)` 후 유지(legacy history.back 대응)

## Parity 체크리스트

- [ ] 5필드(4 required + 공급처 선택)·col-6 레이아웃·드롭다운 4종
- [ ] 성공 시 "완료 (ID:...)" alert + 목록 이동
- [ ] 실패 시 "실패: {message}" alert + 폼 유지
- [ ] required 미입력 시 제출 차단(브라우저 검증)

## 실서버 연동 (swagger — 2026-10-23)

- `POST /api/admin/assets` (ADMIN) — body `{title, productTypeCd, assetTypeCd, platformCd, publisherCd?}`(`asset_name→title`). 응답 `content`: `{id(int64), title, productType, assetType, platform, publisher, regDt}`.
- 드롭다운 4종은 `GET /api/codes`(groupId `PDTP/ASTP/PLFM/PUBL`)에서 조립.
- 실패(400/401/500): 화면은 서버 message 원문이 아니라 `code`→프론트 문구(`shared/api/envelope.ts`)를 `Asset 등록 실패: …` alert로 표시.
- 에러 문구(`ASSET_CREATE_ERRORS`): 400→"입력값을 확인해 주세요. (Asset 명, 유형, 형식, 플랫폼은 필수입니다)", 500→"Asset 등록 중 서버 오류가 발생했습니다. …", 그 외 공통 문구.
