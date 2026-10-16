# TAG 관리 - TAG 그룹설정

## 원본

- 파일: `pc/_Admin_/tag/tag_group_setting.php` (라이브)
- 형제: `tag_group_list.php`(#63), `tag_group_ps.php`(처리)
- 엔티티: 기존 `tag` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/tag/tag_group_setting` (파라미터 없음)
- 성격: **미분류 태그에 그룹 지정.** 목록 + 행별 그룹 select + 설정 버튼.

- 화면 요소 (legacy 기준):
  - page_title `TAG 그룹설정` / breadcrumb: 홈 > 상품 > TAG 관리 > TAG 그룹설정
  - `col-8` 카드, form + 테이블(`table-centered w-100 table-bordered nowrap table-sm`), 5컬럼:
    - 번호(1부터) / 태그명(국문)=`tag_name` / 태그명(영문)=`tag_name_en`
    - 태그그룹: `select name="tag_group_code[]"` — **하드코딩 옵션**(`:::TAG 그룹 선택:::` + G0/GT001~009/C0001~0005/T0001~0006/P0001~0005, 총 26+1)
    - 비고: `TAG 그룹설정` 버튼(btn_tag_group, data-num=idx, data-mode=tag_group_config)
  - 필터·페이지네이션 없음.

### 특이/참고

- `$selected['tag_group_code']`가 코드 어디에서도 채워지지 않음 → **옵션 사전선택 없음(dead)**. 첫 옵션(`:::TAG 그룹 선택:::`) 표시. (미분류 태그이므로 tag_group_code도 통상 빈값)
- game_count/dlc_count는 합산(`$total_game`, `$total_dlc`)되나 **미표시(dead)** → 이식 생략.
- 버튼 클릭: `POST tag_group_ps.php {mode:tag_group_config, tag_group_code:선택값, num:idx}` → `location.reload()`.

## 데이터 (legacy)

- `Admin::getTagGroupNonList()` — 미분류 태그: idx, tag_name, tag_name_en, tag_group_code(빈값), game_count, dlc_count.

## API 계약 (백엔드 전달)

### `GET /admin/tag/unassigned`

- 파라미터 없음. 미분류 태그 목록.

응답 `200`: `{ "items": [{ "idx": 501, "tag_name": "핵앤슬래시", "tag_name_en": "Hack and Slash", "tag_group_code": "" }] }`

### `POST /admin/tag/group-config`

legacy `tag_group_ps.php mode=tag_group_config`.
- 요청: `{ "idx": 501, "tag_group_code": "GT001" }`
- 응답 `200`: `{ "success": true }`
- 프론트: onSuccess 목록 invalidate(=legacy location.reload).

## 타겟 매핑

- 라우트: `routes/tag/tag_group_setting.tsx` → `/tag/tag_group_setting`
- screens: `screens/tag-group-setting`
- entities: `tag` 확장 — `TagGroupNonItem`/`TagGroupNonListResponse`/`AssignTagGroupRequest`, `fetchTagGroupNonList`, `assignTagGroup`, `useTagGroupNonList`, `useAssignTagGroup`
- 화면 상수: `TAG_GROUP_OPTIONS`(하드코딩 옵션 26)
- mock: `tag.ts` — `TAG_GROUP_NON_LIST` + `GET /admin/tag/unassigned` + `POST /admin/tag/group-config`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/col-8/5컬럼/하드코딩 옵션 26)
- [ ] 필드/검증 일치 (사전선택 없음, 버튼 data-num=idx)
- [ ] 분기/플로우 일치 (설정 버튼→group-config→reload)
- [ ] 엣지케이스 일치 (미선택 값 전송, 목록 없음)
