# 자동메일발송 로그

M6(회원 관리) — 자동메일 관리 그룹 두 번째 화면. legacy `directsend_mail_log.php` — tbl_email_api 발송 로그 목록 + 필터(발송구분/발송결과/발송대상, 50/page).

## 원본
- 파일: `pc/_Admin_/member/directsend_mail_log.php` (라이브, 268줄)
- `src/classes/AdminV1.php` getDirectSendMailLog (50/page)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/NOTIFICATION-EMAIL.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/directsend_mail_log` (GET). 파라미터: `page`(기본 1), `gubun`(""/join/password/qna, 기본 all), `failed`(""/0/1, 기본 all), `search_type`(값 `tea.email`), `search_value`.
- topmenu member active. sidebar_member.

### 화면 요소
- page-title-box: breadcrumb(홈/회원/**자동메일 관리**/자동메일발송 로그), h4.
- **검색필터 카드**(bg-secondary "검색필터"), `<form method=get>`:
  - 검색어(select search_type 단일[발송대상, value=`tea.email`] + text search_value)
  - 발송구분(radio ""=전체/join=가입인증/password=비밀번호찾기/qna=문의답변)
  - 발송결과(radio ""=전체/0=성공/1=실패)
  - float-end "검색"
- 요약: `{total_results} 개` (전체건수 표기 없음, 검색결과 total만).
- **목록 table** (table-hover table-centered nowrap table-sm table-bordered), thead table-light font-13, 9컬럼:
  1. 번호 = `total_results - (num + (page-1)*50)` (내림차순, num 루프 내 → 정상)
  2. 발송유형 — `DirectSend API` (정적)
  3. 발송구분 — gubun label(join=가입인증/password=비밀번호찾기/qna=문의답변)
  4. 발송대상 — email
  5. 발송일시 — reg_date
  6. 발송결과 — result
  7. 발송실패 — `failed != 0 ? "실패" : ""`
  8. 상태 — state label(1 발송대기/2 성공/3 일시적/4 도메인에러/5 서버연결/6 메일박스/7 기타/8 수신거부)
  9. 오류내용 — SmtpMsg (width 150px)
- 서버 페이지네이션 `links_html` → `ServerPagination`(**50/page**).
- 정렬 없음(`tea.reg_date DESC` 고정).

### 검색 규칙
- gubun != all → `tea.gubun = '{gubun}'`.
- failed != all: `failed==1` → `tea.failed IN(1,4)`, 아니면 `tea.failed = '{failed}'`(0=성공).
- search_value → `tea.email = '{v}'`(등호).

### 분기/세션
- 단일 GET 렌더(읽기 전용). 검색 GET 리로드. mutation 없음. lib.php 관리자 세션 가드(공통).
- (legacy 행마다 getMemberInfo(m_no) 호출하나 출력 미사용 — dead, 미이식.)

## 데이터 (legacy)
- getDirectSendMailLog: `SELECT tea.* FROM tbl_email_api tea WHERE 1 {add_where} ORDER BY {orderby}`, **50/page**.
- 컬럼: gubun/email/reg_date/result/failed/state/SmtpMsg/m_no.

## API 계약 (백엔드 전달)

### `GET /admin/member/directsend/mail-log`
자동메일 발송 로그(tbl_email_api) 목록 + 필터 + 페이지네이션(50/page).

**요청 쿼리**: `page`, `gubun`(join/password/qna), `failed`(0/1), `search_type`(tea.email), `search_value`(빈값·all 미전송).

**응답 200** `DirectSendMailLogResponse`:
```jsonc
{
  "items": [
    { "gubun": "join", "email": "hong@x.com", "reg_date": "2026-07-20 10:00:00",
      "result": "success", "failed": 0, "state": 2, "smtp_msg": "" }
  ],
  "pagination": { "current_page": 1, "total_results": 128, "total_pages": 3 }
}
```
- 백엔드: gubun 등호, failed=1→IN(1,4)·failed=0→=0, email 등호, tea.reg_date DESC, 50/page.
- 에러: 500(`Error!: {msg}`).

## 타겟 매핑
- 라우트: `/member/directsend_mail_log` (`routes/member/directsend_mail_log.tsx`, validateSearch page/gubun/failed/search_type/search_value)
- entities: `entities/member` 확장 — DirectSendMailLogItem/Response/Search + MAIL_GUBUN_LABEL·MAIL_STATE_LABEL, `fetchDirectSendMailLog`·`useDirectSendMailLog`
- screen: `screens/member-directsend-log` — 검색폼 + 9컬럼
- mock: `handlers/member.ts` 확장 — directsend/mail-log(로그 데이터셋 + 필터/페이지)

## Parity 체크리스트
- [ ] 검색필터(search_type tea.email·gubun 4종·failed 3종) 일치
- [ ] 요약 "{N} 개" 일치
- [ ] 9컬럼(번호·발송유형 static·구분/상태 라벨·발송실패 조건) 일치
- [ ] 필터 규칙(gubun·failed IN(1,4)·email 등호) 일치
- [ ] 50/page 페이지네이션 일치
