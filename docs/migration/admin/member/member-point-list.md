# 포인트 지급/차감 내역

M6(회원 관리) — 포인트 관리 그룹 첫 화면. legacy `member_point_list.php` — tbl_emoney_log 내역 목록 + 검색(아이디) + 지급/차감 필터(50/page).

## 원본
- 파일: `pc/_Admin_/member/member_point_list.php` (라이브 — 변형 없음, 258줄)
- `src/classes/AdminV1.php:196` getMemberPointList (50/page), getMemberNo, getMemberInfo
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/member_point_list` (GET). 파라미터: `page`(기본 1), `search_type`(값 `tm.m_id`), `search_value`, `emoney_type`(all/+/-, 기본 all).
- topmenu member active. sidebar_member.

### 화면 요소
- page-title-box: breadcrumb(홈/회원/회원관리/**포인트 지급/차감 내역**), h4.
- **검색필터 카드**(bg-secondary "검색필터"), `<form method=get>`:
  - 검색어(select search_type 단일 옵션[아이디, value=`tm.m_id`] + text search_value)
  - 지급/차감구분(radio all/+/- = 전체/지급/차감)
  - float-end "회원 검색"
- 요약: `검색 : {total_results}건 / 전체 : {all_cnt} 건` (all_cnt = COUNT tbl_emoney_log WHERE m_no IS NOT NULL).
- **목록 table** (table-centered nowrap table-sm table-bordered border-light), thead table-light font-13, 8컬럼:
  1. 번호 = `total_results - (num + (page-1)*50)` (내림차순, num 루프 내 증가 → 정상)
  2. 아이디 — `m_id` → `member_point_form?search_type=tm.m_id&search_value={m_id}` 링크
  3. 회원등급 — mem_level label(일반/정회원/VIP)
  4. 구분 — `emoney_type=="+"` → `<strong class="text-primary">지급</strong>` / else `<strong class="text-danger">차감</strong>`
  5. 지급/차감액 — `number_format(emoney) + " 원"`
  6. 지급/차감일 — regdt
  7. 처리자 — admin_id
  8. 사유 — memo
- 서버 페이지네이션 `links_html` → `ServerPagination`(**50/page**).
- 정렬 없음(`tel.sno DESC` 고정).
- 페이지 hover 스타일 #FFF0F0 이식.

### 검색 규칙
- search_value 있으면 `getMemberNo(search_value)` → `tel.m_no = '{m_no}'`. (아이디 완전일치로 m_no 조회. 없으면 m_no='' → 결과 0)
- emoney_type != all → `tel.emoney_type = '{+|-}'`.

### 분기/세션
- 단일 GET 렌더. 검색 GET 리로드. mutation 없음(읽기 전용). lib.php 관리자 세션 가드(공통).

## 데이터 (legacy)
- getMemberPointList: `SELECT tel.* FROM tbl_emoney_log tel WHERE tel.m_no IS NOT NULL {add_where} ORDER BY {orderby}`, **50/page**.
- 행마다 `getMemberInfo(m_no)`로 m_id/mem_level 조인(렌더 시).
- all_cnt: `COUNT(1) FROM tbl_emoney_log WHERE m_no IS NOT NULL`.

## API 계약 (백엔드 전달)

### `GET /admin/member/point/list`
포인트 로그(tbl_emoney_log) 목록 + 검색 + 페이지네이션(50/page). 회원 m_id/mem_level 조인.

**요청 쿼리**: `page`, `search_type`(tm.m_id), `search_value`(아이디), `emoney_type`(+/-; all·빈값 미전송).

**응답 200** `MemberPointListResponse`:
```jsonc
{
  "items": [
    { "sno": 90012, "m_no": 100231, "m_id": "hong123", "mem_level": 2,
      "emoney_type": "+", "emoney": 5000, "regdt": "2026-07-20 10:00:00",
      "admin_id": "admin1", "memo": "리뉴얼 기념 포인트 지급" }
  ],
  "pagination": { "current_page": 1, "total_results": 320, "total_pages": 7 },
  "total_all": 15234   // tbl_emoney_log WHERE m_no IS NOT NULL 전체
}
```
- 백엔드: search_value→getMemberNo(m_id)→m_no 필터, emoney_type 등호, tel.sno DESC, 50/page, 회원 조인.
- 에러: 500(`Error!: {msg}`).

## 타겟 매핑
- 라우트: `/member/member_point_list` (`routes/member/member_point_list.tsx`, validateSearch page/search_type/search_value/emoney_type)
- entities: `entities/member` 확장 — MemberPointLogItem/Response/Search, `fetchMemberPointList`·`useMemberPointList`
- screen: `screens/member-point-list` — 검색폼 + 8컬럼 + emoney_type 구분 색상
- mock: `handlers/member.ts` 확장 — point/list(로그 데이터셋 + 필터/페이지)
- member_point_form 링크는 후속(#189)에서 이관 예정 대상

## Parity 체크리스트
- [ ] 검색필터(search_type tm.m_id·emoney_type 3종) 일치
- [ ] 요약 "검색 N건 / 전체 M 건" 일치
- [ ] 8컬럼(번호 내림차순·아이디 링크·등급·구분 색상·금액 원·처리자·사유) 일치
- [ ] 구분 색상(지급 primary / 차감 danger) 일치
- [ ] 50/page 페이지네이션 일치
- [ ] 검색(m_id→m_no)·emoney_type 필터 일치
- [ ] hover 스타일 이식
