# 승인대기 리스트

M6(회원 관리) 네 번째 단위. legacy `member_list_ready.php` — status=5(승인대기) 회원 목록 + 검색(search_type) + 정적 안내 + 가입승인(apply)/삭제(delete).

## 원본
- 파일:
  - `pc/_Admin_/member/member_list_ready.php` (라이브 — 변형 없음, 232줄)
  - `pc/_Admin_/member/member_proc.php` (mode=apply, delete 사용)
  - `src/classes/AdminV1.php:43` getMemberReadyList (status=5, 30/page)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/member_list_ready` (GET). 파라미터: `page`(기본 1), `search_type`(m_id/name/nickname), `search_value`.
- topmenu member active. sidebar_member.

### 화면 요소
- page-title-box: breadcrumb(홈/회원/회원관리/**승인대기 리스트**), h4.
- **검색필터 카드**(bg-secondary "검색필터"), `<form method=get>`: 검색어(select search_type 3옵션[아이디/이름/닉네임] + text search_value) + float-end "회원 검색". (회원가입일/등급 등 다른 필터 없음)
- **정적 안내 박스**(border-bottom): "* 다이렉트게임즈 로그인 불가능 국가 :" + 국가 목록(RU 러시아 … SG 싱가포르) text-danger + 금지 사유 안내문. **원문 그대로 이식**.
- 요약: `검색 : {total_results} 명 / 전체 : {all_cnt} 명` (all_cnt = COUNT status=5).
- **목록 table** (table-centered nowrap table-sm table-bordered border-light), thead table-light font-13, 8컬럼:
  1. 번호 = `total_results - (num + (page-1)*30)` (내림차순)
  2. 아이디 — `m_id` → `member_view?m_no=` 링크
  3. 이름(닉네임) — `name` + `(nickname)`
  4. IP — `ip`
  5. country — `country`
  6. 회원가입일 — `reg_date`
  7. 가입채널 — `channel`
  8. (버튼) 가입승인 btn-primary(apply) + 삭제 btn-danger(delete)
- 서버 페이지네이션 `links_html` → `ServerPagination`(30/page).
- 정렬 없음(기본 `tm.reg_date DESC` 고정).

### 검색 규칙
- m_id → `LIKE '{v}%'`, name/nickname → `= '{v}'`(등호, default case). search_value 없으면 필터 미적용.

### 승인/삭제 플로우
- `member_proc(m_id, m_no, mode)` (mode=apply|delete):
  - msg = delete→"삭제", apply→"가입승인"
  - `confirm("{m_id} 회원을 {msg}처리 하시겠습니까?")` → POST `member_proc.php` {mode, m_no} →
  - 성공(`{success:true}`): `alert("회원{msg}완료")` + `location.reload()`.
- 서버(백엔드): apply=`UPDATE tbl_member SET status=0` / delete=`DELETE sns_info` + `DELETE tbl_member`. 트랜잭션.

### 분기/세션
- 단일 GET 렌더. 검색 GET 리로드. 승인/삭제 AJAX 후 reload. lib.php 관리자 세션 가드(공통).

## 데이터 (legacy)
- getMemberReadyList($page,$add_where,$orderby,$param): `SELECT tm.* FROM tbl_member tm WHERE tm.status=5 {add_where} ORDER BY {orderby}`, 30/page, Pagination(links_html).
- all_cnt: `SELECT COUNT(1) FROM tbl_member WHERE status=5`.

## API 계약 (백엔드 전달)

### `GET /admin/member/ready`
승인대기(status=5) 목록 + 검색 + 페이지네이션(30/page).

**요청 쿼리**: `page`, `search_type`(m_id/name/nickname), `search_value`(빈값 미전송).

**응답 200** `MemberReadyListResponse`:
```jsonc
{
  "items": [
    { "m_no": 100240, "m_id": "waiting01", "name": "대기자", "nickname": "닉",
      "ip": "1.2.3.4", "country": "KR", "reg_date": "2026-07-28 10:00:00", "channel": "web" }
  ],
  "pagination": { "current_page": 1, "total_results": 12, "total_pages": 1 },
  "total_all": 12   // status=5 전체
}
```
- 백엔드: m_id=LIKE·name/nickname=등호, reg_date DESC 고정, 30/page.
- 에러: 500(`Error!: {msg}`).

### `POST /admin/member/apply`  ·  `POST /admin/member/delete`
가입승인 / 삭제(member_proc mode=apply|delete).

**요청**: `{ m_no: number }` · **응답 200**: `{ success: true }`
- 백엔드: apply=status=0 / delete=sns_info·tbl_member 삭제. 트랜잭션.

## 타겟 매핑
- 라우트: `/member/member_list_ready` (`routes/member/member_list_ready.tsx`, validateSearch page/search_type/search_value)
- entities: `entities/member` 확장 — MemberReadyItem/Response/Search, `fetchMemberReadyList`·`useMemberReadyList`, `applyMember`·`deleteMember` + `useApplyMember`·`useDeleteMember`(invalidate)
- screen: `screens/member-ready` — 검색폼 + 정적 안내 + 8컬럼 + 승인/삭제
- mock: `handlers/member.ts` 확장 — ready(status=5 데이터셋) + apply/delete
- member_view 링크는 #185에서 이관됨(활성 링크)

## Parity 체크리스트
- [ ] 검색필터(search_type 3종·search_value) 요소·기본값 일치
- [ ] 정적 안내 박스(국가 목록·사유) 원문 일치
- [ ] 요약 "검색 N 명 / 전체 M 명" 일치
- [ ] 8컬럼(번호 내림차순·member_view 링크·country/channel) 일치
- [ ] 검색 규칙(m_id LIKE / name·nickname 등호) 일치
- [ ] 30/page 페이지네이션 일치
- [ ] 가입승인/삭제(confirm·alert 동적 문구·reload) 일치
