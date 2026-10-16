# 한글패치 관리 - 한글패치 인증정보 확인

## 원본

- 파일: `pc/_Admin_/goods/korean_patch_auth.php` (라이브)
- 형제: `korean_patch.php`(#60, 동일 `getKoreanPatchList`)
- 엔티티: 기존 `korean-patch` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/goods/korean_patch_auth`
  - `search_m_id`(회원아이디), `search_patch_goods`(선택 patch idx), `patch_goods`(name), `prefix_text`, `encode_type`
- 성격: **회원아이디 + 한글패치상품 선택 → 해당 회원의 인증 비밀번호 계산/표시.**

- 화면 요소 (legacy 기준):
  - page_title `한글패치 인증정보 확인` / breadcrumb: 홈 > 상품 > 한글패치 관리 > 한글패치 인증정보 확인
  - 검색필터 카드(`검색필터`):
    - 회원아이디 text(`search_m_id`, required)
    - 한글패치상품 select(`search_patch_goods`, required): `:::한글패치선택::::` + `getKoreanPatchList` 옵션(value=idx, data-prefix, data-encodetype, text=goods_nm)
    - hidden: `patch_goods`(선택 name), `prefix_text`, `encode_type` — 제출 시 JS가 선택 옵션에서 채움
    - submit `회원 검색`
  - 결과 카드(`인증정보 확인`), 테이블 5컬럼:
    - 회원고유번호(실제로는 행번호 `1` 표시 — legacy도 `$num`) / 한글패치상품(`patch_goods`) / 한글패치인증 아이디(`search_m_id`) / 한글패치인증 비밀번호(`patchEncDataAdmin`) / 비밀번호 복사 버튼
    - `search_m_id` 있을 때만 1행 표시(없으면 빈 목록).
  - **검증(JS)**: 회원아이디 빈값 → alert("검색할 회원아이디를 입력해주세요.") / 패치 미선택 → alert("제공할 패치상품을 선택해주세요.") 후 제출 취소.

### 특이/참고

- 비밀번호 = `patchEncDataAdmin(m_id, prefix_text, encode_type)` (base64/md5 계열, **백엔드 계산**).
- 회원고유번호 컬럼은 라벨과 달리 행번호(1)를 표시(legacy quirk 그대로).
- legacy JS 검증에서 `#searchValue`를 참조하나 실제 input id는 `search_m_id`(legacy 버그로 회원아이디 빈값 검증 미작동 가능) → 타겟은 `search_m_id` 기준으로 정상 검증(동작 의도 반영). *주: 빈값 required 속성으로도 막힘.*

## 데이터 (legacy)

- 드롭다운: `AdminGoods::getKoreanPatchList()` — idx/goods_nm/prefix_text/encode_type.
- 비밀번호: `AdminGoods::patchEncDataAdmin($search_m_id, $prefix_text, $encode_type)`.

## API 계약 (백엔드 전달)

### `GET /admin/goods/korean-patches` (#60 재사용, 항목 확장)

- 응답 항목에 `idx`(number), `encode_type`(string) 포함(드롭다운 data 속성용). #60 화면은 goods_nm/prefix_text만 사용.

### `GET /admin/goods/korean-patches/auth`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `search_m_id` | string | 회원 아이디 |
| `prefix_text` | string | 선택 패치 prefix |
| `encode_type` | string | 선택 패치 인코딩 방식(base64/md5 등) |

백엔드 책임: `patchEncDataAdmin(m_id, prefix_text, encode_type)` 계산 후 비밀번호 반환. (prefix/encode는 legacy와 동일하게 클라이언트 선택값 전달)

응답 `200`: `{ "password": "..." }`

## 타겟 매핑

- 라우트: `routes/goods/korean_patch_auth.tsx` → `/goods/korean_patch_auth`
- screens: `screens/goods-korean-patch-auth`
- entities: `korean-patch` 확장 — `KoreanPatchItem`(+idx,+encode_type), `KoreanPatchAuthSearch`/`KoreanPatchAuthResult`, `fetchKoreanPatchAuth`, `useKoreanPatchAuth`(search_m_id 있을 때만)
- shared: 클립보드 복사(navigator.clipboard)
- mock: `korean-patch.ts` — 리스트에 idx/encode_type 보강 + `GET /admin/goods/korean-patches/auth`(mock 비밀번호 계산)

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/검색필터/드롭다운/5컬럼 결과)
- [ ] 필드/검증 일치 (required, 미선택 alert, 선택 옵션 name/prefix/encode 전달)
- [ ] 분기/플로우 일치 (search_m_id 있을 때만 결과 행, 비밀번호 복사)
- [ ] 엣지케이스 일치 (검색 전 빈 목록, 회원고유번호=행번호)
