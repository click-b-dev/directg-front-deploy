# Asset Code 등록 (Asset 서버 관리 API)

## 원본

- 파일: `pc/_Admin_/goods/asset/asset_code_register.php` (등록 폼) + `asset_ps.php`(mode=asset_code_register)
- 참조: [asset-code-list](asset-code-list.md)(#164), [asset-register](asset-register.md)(#161 폼 패턴)
- 도메인: `Asset::runAssetCodeRegister`

## 화면·플로우

- 진입 URL: `/goods/asset/asset_code_register` (파라미터 없음)
- breadcrumb: 홈 / 재고 / Asset 관리 / **Asset Code 등록**, page title 동일
- **폼**(col-6 card, form-horizontal, label col-3 / 입력 col-9, POST asset_ps.php):
  - `*코드 그룹`(group_id select, **required**, `::: 코드 그룹 선택 :::` + 4옵션 `{gid} / {gname}`: PDTP 상품유형 (Product Type) / ASTP 상품형식 (Asset Type) / PLFM 플랫폼 (Platform) / PUBL 공급처 (Publisher))
  - `*코드명`(name text, **maxlength 64**, **required**, placeholder `코드명 (최대 64자)`)
  - 푸터(justify-between): `← 코드 현황`(link asset_code_list) + `코드 등록`(submit btn-primary)
- 처리(mode=asset_code_register): 세션 admin 없으면 로그인 필요. group_id 화이트리스트(PDTP/ASTP/PLFM/PUBL). name 빈값 검증. `runAssetCodeRegister(group_id,name)` →
  - `res->id` 있으면 `msg("코드 등록 완료 ({id})", "asset_code_list.php")`(성공→목록 이동)
  - 없으면 `msg("코드 등록 실패: {message}", -1)`(실패→alert 후 유지)

## API 계약 (백엔드 전달)

- `POST /admin/goods/asset/code-register` — Asset Code 등록
  - body: `{ group_id, name }`
  - 응답: 성공 `{ id }` / 실패 `{ message }`
  - **백엔드**: 관리자 세션 강제. group_id 화이트리스트(PDTP/ASTP/PLFM/PUBL). name 필수. 외부 Asset API 등록.
- 에러: legacy `msg()`.

## 타겟 매핑

- 라우트: `routes/goods/asset/asset_code_register.tsx`(파라미터 없음)
- screens: `screens/asset-code-register` / entities: `entities/asset` 확장(`registerAssetCode`/`useRegisterAssetCode`, `AssetCodeMutationResponse` 재사용)
- mock: `shared/mocks/handlers/asset.ts` 확장(`/admin/goods/asset/code-register` POST)
- 폼: HTML5 required/maxlength 유지 + onSubmit → mutation. 성공 시 alert + `/goods/asset/asset_code_list`(window.location)·실패 alert. 코드 현황 링크

## Parity 체크리스트

- [ ] 2필드(그룹 select required·코드명 maxlength64 required)·col-6 레이아웃
- [ ] 성공 "코드 등록 완료 ({id})" alert + 목록 이동 / 실패 "코드 등록 실패: {message}" alert
- [ ] 코드 현황 링크·required 미입력 제출 차단

## 실서버 연동 (swagger — 2026-10-23)

- `POST /api/codes` (ADMIN) — body `{groupId(PDTP|ASTP|PLFM|PUBL), name(≤64)}`, 응답 `content:{id,groupId,name,regDt}`. 오류: 400·409(`CONFLICT`, 중복).
- 에러 문구(`CODE_CREATE_ERRORS`): 400→"코드 그룹과 코드명을 확인해 주세요. (코드명은 64자 이내)", 409→"이미 등록된 코드입니다."
