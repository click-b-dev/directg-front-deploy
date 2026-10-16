# 회원 리스트

M6(회원 관리) 두 번째 단위. legacy `member_list.php` — 9종 검색필터 + 헤더 정렬 + 서버 페이지네이션(30/page) + 탈퇴 처리(AJAX) 목록.

## 원본
- 파일:
  - `pc/_Admin_/member/member_list.php` (라이브 — 변형 없음, 473줄)
  - `pc/_Admin_/member/member_proc.php` (탈퇴/삭제/승인/인증초기화 처리기 — 목록은 `mode=leave`만 사용)
  - `src/classes/AdminV1.php:21` `getMemberList`, `:88` `getMemberAge`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/member_list` (GET). 파라미터(전부 optional):
  - `page`(기본 1)
  - `search_type`(m_id/name/nickname/hp/ip/m_no) + `search_value`
  - `member_level`(0 전체/1/2/3)
  - `old_login`(장기 미로그인 일수)
  - `mailling`(all/Y/N), `is_auth`(all/Y/N), `mem_type`(all/P/R/S/E)
  - `start_reg_date`~`end_reg_date`, `start_log_date`~`end_log_date`
  - `sort`(reg_date/log_date) + `dir`(asc/desc) — 헤더 클릭 정렬
- topmenu `member` active. sidebar_member.

### 화면 요소 (legacy 순서)
- page-title-box: breadcrumb(홈 / 회원 / 회원관리 / **회원 리스트**), h4 "회원 리스트".
- **검색필터 카드**(card-header bg-secondary "검색필터"), `<form method="get">`:
  - 1행: 검색어(select search_type 6옵션[아이디/이름/닉네임/휴대폰/접속IP/고유번호] + text search_value) / 회원등급(select member_level 전체·일반·정회원·VIP)
  - 2행: 회원가입일(date~date + 삭제버튼 mdi-delete-outline) / 최종로그인일(date~date + 삭제버튼)
  - 3행: 장기 미로그인(text old_login "일 이상 로그인하지 않은 회원") / 메일수신동의(radio all/Y/N = 전체/수신/수신거부)
  - 4행: 본인인증여부(radio all/Y/N = 전체/인증/미인증) / 회원분류(radio all/P/R/S/E = 전체/일반/리셀러/휴면/이벤트)
  - float-end "회원 검색" submit
- 요약: `검색 : {total_results} 명 / 전체 : {all_cnt} 명` (number_format)
- **목록 table** (table-centered nowrap table-sm table-bordered border-light), thead table-light font-13, 13컬럼:
  1. 번호 = `total_results - (num + (page-1)*30)` (내림차순)
  2. 회원고유번호 `m_no`
  3. 아이디(이메일) — `m_id` → `member_view?m_no=` 링크 + `(email)` 조건부
  4. 이름(닉네임) — `name` + `(nickname)`
  5. 생년월일(나이) — `birth_day` + `(getMemberAge)` 조건부(birth_day 있을 때)
  6. 휴대폰 `hp`
  7. 회원등급 — `mem_level` → 일반/정회원/VIP
  8. 회원가입일 `reg_date` (정렬 헤더)
  9. 최종로그인(접속IP) — `log_date` + `ip` (정렬 헤더)
  10. 방문횟수 `visited`
  11. 가입방법 — `strtoupper(sns_type)`
  12. 회원분류 — `mem_type` → 일반/리셀러/휴면/이벤트
  13. (버튼) 탈퇴 btn-danger → `member_proc(m_id, m_no)`
- 서버 페이지네이션 `links_html` → `ServerPagination`(30/page, First/Prev/Next/Last ±10, ellipses).

### 정렬 로직 (헤더 클릭)
- 화이트리스트 `sort_map`: reg_date→tm.reg_date, log_date→tm.log_date. `dir` = asc 아니면 DESC.
- 기본 정렬: `tm.reg_date DESC`. **단 `mem_type=='R'`(리셀러)이면 `tm.log_date DESC`**.
- `eff_sort`/`eff_dir`: 명시 sort 있으면 그 값, 없으면 기본(R이면 log_date/DESC, 아니면 reg_date/DESC).
- 헤더 링크: `?sort={col}&dir={현재 col·DESC면 asc, 아니면 desc}{sort_param}`. sort_param = 현재 필터(page/sort/dir 제외 non-empty) 유지. 화살표 ▼(DESC)/▲(ASC) 현재 정렬 컬럼에만.

### getMemberAge quirk (원문 유지)
- `birth_day` 길이 6(YYMMDD): `date('y') > yy` 이면 20yy, 아니면 19yy. 길이 그 외(YYYYMMDD): 앞 4자리.
- 나이 = `date('Y') - 출생연도`. **월/일 보정은 주석처리(`//$age=$age-1`) → 연도 차이만** (만나이 아님, 버그성 quirk 이식).

### 탈퇴 플로우
- `member_proc(m_id, m_no)` → `confirm("{m_id} 회원을 탈퇴처리 하시겠습니까?")` → POST `member_proc.php` {mode:leave, m_no} →
  - 성공(`{success:true}`): `alert("회원탈퇴완료")` + `location.reload()` (목록 갱신).
- 서버 leave 처리(백엔드): `tbl_member` status=1·out_date=NOW → `sns_info` DELETE → `tbl_log_hack` INSERT(admin_id 세션). 트랜잭션.

### 분기/리다이렉트
- 없음(단일 GET 렌더). 검색 폼 = GET 리로드. 정렬/페이지 = GET 링크. 탈퇴 = AJAX 후 reload.

### 세션/권한 의존 (백엔드)
- lib.php 관리자 세션 가드(공통, #2). leave 시 `$_SESSION['admin']['admin_id']`를 log_hack에 기록 → **백엔드 책임**.

## 데이터 (legacy)
- DB: `dsn_dgkr`(DGKR). 클래스 `AdminV1 extends Pagination`.
- `getMemberList($page,$add_where,$orderby,$param)`: `SELECT tm.* FROM tbl_member tm WHERE tm.status=0 {add_where} ORDER BY {orderby}`, 30/page, Pagination(links_html).
- `all_cnt`: `SELECT COUNT(1) FROM tbl_member WHERE status=0`.
- 필터 WHERE(백엔드 도출): member_level=`tm.mem_level={n}` / old_login=`DATEDIFF(NOW,tm.log_date)>={n}` / mailling·is_auth·mem_type=`tm.{col}='{v}'`(all 아닐 때) / reg_date·log_date BETWEEN(log_date는 한쪽만 있으면 >= 또는 <=) / 검색: m_id `LIKE '{v}%'`, name/nickname/hp/ip `={v}`(등호), m_no `={int}`.

## API 계약 (백엔드 전달)

### `GET /admin/member/list`
회원(status=0) 목록 + 필터 + 정렬 + 페이지네이션(30/page).

**요청 쿼리**: `page`, `search_type`, `search_value`, `member_level`, `old_login`, `mailling`, `is_auth`, `mem_type`, `start_reg_date`, `end_reg_date`, `start_log_date`, `end_log_date`, `sort`, `dir` (빈값 미전송).

**응답 200** `MemberListResponse`:
```jsonc
{
  "items": [
    {
      "m_no": 100234, "m_id": "hong123", "email": "hong@x.com",
      "name": "홍길동", "nickname": "길동", "birth_day": "900101",
      "hp": "010-1234-5678", "mem_level": 2,
      "reg_date": "2024-05-01 12:00:00", "log_date": "2026-07-20 09:00:00",
      "ip": "1.2.3.4", "visited": 42, "sns_type": "kakao", "mem_type": "P"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 1523, "total_pages": 51 },
  "total_all": 1200000   // status=0 전체(필터 무관)
}
```
- 백엔드: WHERE 빌드(위 필터 규칙), 정렬 화이트리스트(reg_date/log_date, mem_type=R 기본 log_date), 30/page. 검색 등호/LIKE 규칙 원문 유지.
- 에러: 500(`Error!: {msg}`).

### `POST /admin/member/leave`
회원 탈퇴 처리(목록 탈퇴 버튼).

**요청**: `{ m_no: number }`
**응답 200**: `{ success: true }`. m_no 무효 시 legacy는 `"잘못된 요청입니다."`(비 JSON) — 프런트 표준 에러.
- 백엔드: status=1·out_date=NOW, sns_info DELETE, tbl_log_hack INSERT(admin 세션). 트랜잭션.

## 타겟 매핑
- 라우트: `/member/member_list` (`routes/member/member_list.tsx`, validateSearch 14필드)
- entities: `entities/member` (신규) — types(MemberListItem/Response/Search/Pagination) + `getMemberAge`·MEMBER_LEVEL/MEMBER_TYPE 라벨 + `fetchMemberList` + `useMemberList` + `useLeaveMember`(invalidate)
- screen: `screens/member-list` — 검색필터 `<form method=get>`(defaultValue/defaultChecked), 정렬 헤더 링크, ServerPagination, 탈퇴 confirm→alert
- mock: `shared/mocks/handlers/member.ts` (신규) + 등록. 고정 목록(status=0 회원 여러 건, mem_type/level/sns 다양)
- member_view 링크는 미이관 라우트(후속 단위) 대상

## Parity 체크리스트
- [ ] 검색필터 9종(select/text/date/radio) 요소·기본값·selected 일치
- [ ] 요약 "검색 N 명 / 전체 M 명" 일치
- [ ] 13컬럼(번호 내림차순·링크·조건부 email/age·라벨 매핑·sns 대문자) 일치
- [ ] 정렬(기본 reg_date DESC, mem_type=R log_date DESC, 헤더 토글·화살표·sort_param 유지) 일치
- [ ] getMemberAge quirk(연도차·century 판별) 일치
- [ ] 페이지네이션(30/page, links_html) 일치
- [ ] 탈퇴(confirm 문구·alert·reload) 일치
- [ ] 빈 목록/엣지(email·birth_day 없음) 일치
