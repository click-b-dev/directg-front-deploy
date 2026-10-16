# 간편로그인 연동현황 (NAVER/KAKAO/PAYCO)

M6(회원 관리) 다섯 번째 단위. legacy `member_naver_list.php`·`member_kakao_list.php`·`member_payco_list.php` — **3파일이 sns_type/page_title만 다른 동일 화면**. 재사용 스크린 1개 + 라우트 3개로 이관.

## 원본
- 파일: `pc/_Admin_/member/member_naver_list.php` / `member_kakao_list.php` / `member_payco_list.php` (라이브 — 변형 없음, 각 ~250줄)
  - 세 파일 diff: `sns_type = 'NAVER'|'KAKAO'|'PAYCO'` + `page_title` 뿐. 컬럼·필터·정렬·버그 전부 동일.
- `src/classes/AdminV1.php` getMemberSnsList / getMemberAge
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/member_naver_list` · `/member/member_kakao_list` · `/member/member_payco_list` (GET).
- 파라미터: `page`(기본 1), `search_type`(m_id/name/nickname/ip), `search_value`, `sns_flag`(all/N/C, 기본 all).
- topmenu member active. sidebar_member.

### 화면 요소
- page-title-box: breadcrumb(홈/회원/회원관리/**간편로그인 연동현황(PROVIDER)**), h4.
- **검색필터 카드**(bg-secondary "검색필터"), `<form method=get>`:
  - 검색어(select search_type 4옵션[아이디/이름/닉네임/접속IP] + text search_value)
  - 연결구분(radio all/N/C = 전체/**신규가입**/**계정연결**)
  - float-end "회원 검색"
- 요약: `검색 : {total_results} 명 / 전체 : {all_cnt} 명` (all_cnt = status=0 ∩ sns_type=PROVIDER).
- **목록 table** (table-centered nowrap table-sm table-bordered border-light), thead table-light font-13, 9컬럼:
  1. 번호 — **legacy 버그: 페이지 내 모든 행 동일값** `total_results - (0 + (page-1)*20)` ($num++ 가 foreach 밖 → num 항상 0). 게다가 페이징은 30/page인데 ×20(불일치). **버그 그대로 이식**.
  2. 아이디(이메일) — `m_id` → `member_view?m_no=` 링크 + `(email)` 조건부
  3. 이름(닉네임)
  4. 생년월일(나이) — birth_day + getMemberAge 조건부
  5. IP(country) — `ip` + `(country)`
  6. 방문횟수 — visited
  7. 연결구분 — flag label(**N=신규 가입 / C=계정 연결**, 표 셀은 공백 있는 "신규 가입")
  8. 가입일 — reg_date
  9. 간편로그인 연결일자 — sns_connect_date
- 서버 페이지네이션 `links_html` → `ServerPagination`(**30/page**).
- 정렬 없음(`si.idx DESC` 고정).
- 페이지 고유 hover 스타일: `.table-responsive table tr:hover{background-color:#FFF0F0}` — 이식.

### 검색 규칙
- m_id → `LIKE '{v}%'`, name/nickname/ip → `= '{v}'`(등호). search_value 없으면 미적용.
- sns_flag != all → `si.flag = '{N|C}'`.

### 분기/세션
- 단일 GET 렌더. 검색 GET 리로드. mutation 없음(읽기 전용). lib.php 관리자 세션 가드(공통).

## 데이터 (legacy)
- getMemberSnsList: `SELECT tm.*, si.sns_type, si.flag, si.sns_connect_date FROM tbl_member tm INNER JOIN sns_info si ON tm.m_no=si.m_no WHERE tm.status=0 {add_where} ORDER BY {orderby}`, **30/page**. add_where = `AND si.sns_type='{PROVIDER}'` + 필터.
- all_cnt: `COUNT(1) FROM tbl_member tm JOIN sns_info si ON tm.m_no=si.m_no WHERE tm.status=0 AND si.sns_type='{PROVIDER}'`.

## API 계약 (백엔드 전달)

### `GET /admin/member/sns`
간편로그인 연동 회원(status=0 ∩ sns_type) 목록 + 검색 + 페이지네이션(30/page).

**요청 쿼리**: `sns_type`(NAVER/KAKAO/PAYCO, 필수), `page`, `search_type`(m_id/name/nickname/ip), `search_value`, `sns_flag`(N/C; all·빈값 미전송).

**응답 200** `MemberSnsListResponse`:
```jsonc
{
  "items": [
    { "m_no": 100230, "m_id": "reseller_kim", "email": "kim@x.com", "name": "김리셀",
      "nickname": "리셀러킴", "birth_day": "850320", "ip": "5.6.7.8", "country": "KR",
      "visited": 987, "flag": "C", "reg_date": "2023-11-20 08:40:00",
      "sns_connect_date": "2024-01-05 10:00:00" }
  ],
  "pagination": { "current_page": 1, "total_results": 42, "total_pages": 2 },
  "total_all": 42
}
```
- 백엔드: sns_type 필터 필수, m_id=LIKE·name/nickname/ip=등호·flag 등호, si.idx DESC, 30/page.
- 에러: 500(`Error!: {msg}`).

## 타겟 매핑
- 라우트: `/member/member_naver_list` · `_kakao_list` · `_payco_list` (각 route가 provider 지정)
- entities: `entities/member` 확장 — MemberSnsItem/Response/Search, SNS_FLAG_LABEL, `fetchMemberSnsList(provider, search)` · `useMemberSnsList`
- screen: `screens/member-sns` — 재사용, `provider` prop으로 title/fetch 분기, 번호 버그·×20 그대로
- mock: `handlers/member.ts` 확장 — sns(members 재사용 + sns 필드 합성, sns_type 필터)
- member_view 링크 활성(#185)

## Parity 체크리스트
- [ ] 3 라우트 각 provider title/데이터 일치
- [ ] 검색필터(search_type 4종·sns_flag 3종) 일치
- [ ] 9컬럼 일치
- [ ] **번호 버그(페이지 내 동일값·×20)** 그대로 재현
- [ ] flag 라벨(신규 가입/계정 연결) 일치
- [ ] 30/page 페이지네이션 일치
- [ ] hover 스타일(#FFF0F0) 이식
- [ ] 검색 규칙(m_id LIKE / 등호 / flag) 일치
