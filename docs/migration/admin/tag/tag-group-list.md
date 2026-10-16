# TAG 관리 - TAG 그룹현황

## 원본

- 파일: `pc/_Admin_/tag/tag_group_list.php` (라이브)
- 형제: `tag_group_setting.php`(그룹설정, 후속), `tag_group_ps.php`(처리)
- 신규 도메인(TAG) — `tag` 엔티티 신설. topmenu=`tag`.

## 화면·플로우

- 진입 URL/파라미터: `/tag/tag_group_list` (파라미터 없음)
- 성격: **읽기 전용 3단계 계층 트리.** 태그 대분류(depth1) → 중분류(depth2 아코디언) → 태그.

- 화면 요소 (legacy 기준):
  - page_title `TAG 그룹현황` / breadcrumb: 홈 > 상품 > TAG 관리 > TAG 그룹현황
  - 테이블(`table table-bordered`, colgroup 10%/*):
    - depth1 그룹마다 1행: th(`table-active text-center border`) = `[{tags_group_code}]<br>{tags_group_name}<br>{idx}`
    - td: `row g-2` 그리드, depth2 서브그룹마다 `col-3` 아코디언:
      - `.accordion > .accordion-item`: 버튼 `[{tags_group_code}] {tags_group_name}`
      - 펼침 시 `.list-group`: 태그마다 `.list-group-item` = `[{tag_code}] {tag_name}`
  - 필터·페이지네이션 없음.

### 특이/참고

- Bootstrap JS 미로드 → 아코디언 collapse를 **React state로 재현**(사이드바 `SidebarCollapse`와 동일 방침). `.accordion-button.collapsed` / `.accordion-collapse.collapse(.show)` 클래스 토글(CSS `.collapse:not(.show){display:none}` 활용).
- `$group_code` 맵(G/P/M… → 명칭)은 정의되나 마크업 미사용(dead) → 이식 생략.
- `btn_tag_delete` JS 핸들러 존재하나 이 목록에 삭제 버튼 미렌더(dead) → 이식 생략.

## 데이터 (legacy)

- `Admin::getTagGroupList("1")` — depth1(대분류): idx, tags_group_code, tags_group_name.
- `Admin::getTagGroupList("2", parent_idx)` — depth2(중분류).
- `Admin::getTagGroupTagList(sub.tags_group_code)` — 태그: tag_code, tag_name.

## API 계약 (백엔드 전달)

### `GET /admin/tag/groups`

- 파라미터 없음.
- 백엔드 책임: depth1→depth2→태그 3단계 트리 조립.

응답 `200`:
```jsonc
{
  "groups": [{
    "idx": 1, "tags_group_code": "G", "tags_group_name": "장르",
    "subgroups": [{
      "idx": 11, "tags_group_code": "G01", "tags_group_name": "액션",
      "tags": [{ "tag_code": "G0101", "tag_name": "핵앤슬래시" }]
    }]
  }]
}
```

## 타겟 매핑

- 라우트: `routes/tag/tag_group_list.tsx` → `/tag/tag_group_list`
- screens: `screens/tag-group-list`
- entities: **신규 `tag`** — `TagLeaf`/`TagSubGroup`/`TagTopGroup`/`TagGroupTreeResponse`, `fetchTagGroupTree`, `useTagGroupTree`
- shared: 아코디언 collapse는 화면 내부 React state(신규 shared 컴포넌트 미승격 — rule of two 전까지 로컬)
- mock: **신규 `shared/mocks/handlers/tag.ts`**(handlers.ts 등록) — `TAG_GROUP_TREE` + `GET /admin/tag/groups`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/3단계 트리/아코디언)
- [ ] 필드 일치 (depth1 code/name/idx, depth2 버튼, 태그 code/name)
- [ ] 분기/플로우 일치 (아코디언 펼침/접힘, 필터·페이지네이션 없음)
- [ ] 엣지케이스 일치 (서브그룹 없음, 태그 없음)
