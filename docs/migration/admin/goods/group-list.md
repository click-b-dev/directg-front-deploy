# 그룹 관리 - 그룹 현황 (그룹 설정)

## 원본

- 파일: `pc/_Admin_/goods/group/group_list.php` (라이브)
- 형제: `group_register.php`(등록/수정), `group_view.php`(상세), `group_ps.php`(처리) — 후속
- 신규 도메인(상품 그룹) — `goods-group` 엔티티 신설.

## 화면·플로우

- 진입 URL/파라미터: `/goods/group/group_list` (파라미터 없음)
- 성격: **읽기 전용 목록 + 등록/수정 링크.**

- 화면 요소 (legacy 기준):
  - h4/breadcrumb active = **`그룹 설정`** (page_title; 사이드바 라벨은 "그룹 현황", 카드 헤더도 "그룹 현황") / breadcrumb: 홈 > 상품 > 그룹 관리 > 그룹 설정
  - 상단 우측: `그룹 등록` 버튼(→ `group_register.php`)
  - 목록 카드(`그룹 현황`), 테이블(`table-centered w-100 nowrap table-sm table-bordered`, thead `table-light font-14`, tbody `font-12`), 9컬럼:
    - 번호 = `idx` / 구분 = `type_label[type]`(1 프로모션/2 타임딜/3 프랜차이즈/99 기타)
    - 그룹명 = `subject`(→ `group_view.php?idx`) / 시작 = `start_date`(unix→`Y-m-d H:i:s`) / 종료 = `end_date`(unix→포맷)
    - 사용여부 = `use_flag`(raw) / PC배너 = `pc_banner_url`?링크(target=_blank):미등록 / 모바일배너 = `banner_url`?링크:미등록
    - 수정 = 버튼(→ `group_register.php?idx`)
  - 시작/종료 셀 색상: 현재시각이 [start,end] 사이 → `text-primary`, now>end → `text-danger`, 그 외 없음.
  - 필터·페이지네이션 없음.

### 특이/참고

- start_date/end_date는 **unix timestamp(초)**. 프론트에서 `Y-m-d H:i:s` 포맷.
- 시각 색상은 현재시각 기준(클라이언트 계산 — legacy는 서버 now).
- 하단 `#exampleModal`(카테고리 추가)은 이 화면에서 트리거 없음(copy-paste dead) → 이식 생략.
- 등록/수정/상세 링크는 후속 화면. 라우트 링크만 매핑(대상 미구현 상태여도 링크 유지).

## 데이터 (legacy)

- `AdminGoods::getGroupList()` — idx, type, subject, start_date(unix), end_date(unix), use_flag, pc_banner_url, banner_url.

## API 계약 (백엔드 전달)

### `GET /admin/goods/groups`

- 파라미터 없음.

응답 `200`:
```jsonc
{
  "items": [{
    "idx": 12, "type": "1", "subject": "여름 프로모션",
    "start_date": 1782000000, "end_date": 1784678400,
    "use_flag": "Y", "pc_banner_url": "https://.../pc.jpg", "banner_url": ""
  }]
}
```

## 타겟 매핑

- 라우트: `routes/goods/group/group_list.tsx` → `/goods/group/group_list`
- screens: `screens/goods-group-list`
- entities: **신규 `goods-group`** — `GroupItem`/`GroupListResponse`, `fetchGroupList`, `useGroupList`
- mock: **신규 `shared/mocks/handlers/goods-group.ts`**(handlers.ts 등록) — `GROUP_LIST` + `GET /admin/goods/groups`

## Parity 체크리스트

- [ ] 화면 요소 일치 (그룹 설정/그룹 등록/9컬럼)
- [ ] 필드 일치 (type_label, 날짜 포맷, 배너 링크/미등록)
- [ ] 분기/플로우 일치 (시각 색상, view/register 링크)
- [ ] 엣지케이스 일치 (배너 미등록, 진행중/종료 색상)
