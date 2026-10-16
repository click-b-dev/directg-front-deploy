# 중국 결제자 리스트

## 원본
- 파일: `pc/_Admin_/china/invoice_member.php` (231줄, 라이브) + `invoice_member_ps.php`(처리기)
- 도메인: `src/classes/China.php::getChinaInvoiceMember`
- 참조 문서: `docs/migration/admin/china/invoice-list.md`(영역 개요), `../legacy-project/src/classes/China.php`

## 화면·플로우
- 진입 URL: `/china/invoice_member` — GET `page`, `search_name`, `search_email`
- 화면 요소:
  - breadcrumb: 홈 / 중국결제 / 중국 결제 관리 / 중국 결제자 리스트
  - h4 "중국 결제자 리스트"
  - 검색필터: 이름 `search_name`(text), 이메일 `search_email`(text), 검색 버튼
  - 카운트 `{total_results} 명` + **"중국 결제자 등록" 버튼**(btn-outline-danger, 모달 트리거)
  - 목록 테이블 5컬럼:
    | 컬럼 | 값 | 비고 |
    |------|-----|------|
    | 번호 | `total_results - (index + (page-1)*20)` | 역순 20/page |
    | 이메일(아이디) | `email` | |
    | 이름 | `name` | |
    | 마지막 접속일자 | `login_date` | |
    | 비밀번호 초기화 | "초기화" 버튼 | `data-idx`, AJAX pwd_reset |
  - tfoot: `colspan=5` text-end `(초기화 비밀번호는 {date('Ymd')})` — 오늘 날짜 YYYYMMDD
  - 서버 페이지네이션 links_html
  - **등록 모달**(signup-modal): 이메일*/이름*/비밀번호*(HTML5 required), POST `invoice_member_ps.php` mode=register
- 분기/플로우:
  - **비밀번호 초기화**: 버튼 클릭 → confirm "해당 회원의 비밀번호를 초기화 하시겠습니까?" → AJAX POST mode=pwd_reset, idx → **`alert(응답)`**(성공 시 서버 빈 응답 → 빈 alert)·**`//location.reload()` 주석 = 목록 미갱신(quirk)**
  - **등록**: 모달 폼 제출(email/name/pwd required) → POST mode=register → `go("invoice_member.php")`(목록 리다이렉트 = 갱신)
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- 목록 `China::getChinaInvoiceMember($page, $add_where, $orderby, $param)`:
  ```sql
  SELECT * FROM directgames.tbl_invoice_member WHERE flag='Y' [add_where] ORDER BY idx DESC
  ```
  - `results_per_page = 20`, `$orderby` 미사용(주석)·`idx desc` 하드코딩
  - add_where: `name like '%{v}%'` / `email = '{v}'`(등호)
  - 화면 사용 필드: `idx`, `email`, `name`, `login_date`
- 처리기 `invoice_member_ps.php`:
  - `pwd_reset`: `UPDATE tbl_invoice_member SET pwd=password('{Ymd}') WHERE idx=:idx` — 초기화 비밀번호 = 오늘 date('Ymd'), **성공 시 echo 없음(빈 응답)**
  - `register`: `INSERT tbl_invoice_member SET email, name, pwd=password(pwd)` → 리다이렉트
  - `delete`(mode=delete, chk[]): **화면에 UI 없음 → 범위 밖**(호출 경로 부재)

## API 계약 (백엔드 전달)
- `GET /admin/china/members` — 결제자 목록
  - 요청: `page`(기본 1), `search_name`(LIKE), `search_email`(등호)
  - 응답: `{ items: [{ idx, email, name, login_date }], pagination: { current_page, results_per_page:20, total_results, total_pages } }`
  - 백엔드: base `flag='Y'`, 정렬 `idx DESC`, 20/page
- `POST /admin/china/members/pwd-reset` — 비밀번호 초기화
  - 요청: `{ idx }`
  - 응답: `{ message: string }` — **legacy 성공 시 빈 응답(빈 alert 재현 위해 mock message="")**
  - 백엔드: `pwd = password(오늘 YYYYMMDD)` 갱신. **목록 미갱신(invalidate 없음) 이식**
- `POST /admin/china/members` — 결제자 등록
  - 요청: `{ email, name, pwd }`(모두 필수)
  - 응답: `{ success: boolean, message: string }`
  - 백엔드: `INSERT ... pwd=password(pwd)`. 성공 시 목록 리다이렉트 = 프론트 invalidate

## 타겟 매핑
- 라우트: `/china/invoice_member` (`routes/china/invoice_member.tsx`)
- screens: `screens/china-invoice-member`
- entities: `entities/china` 확장(member list + pwd-reset + register)
- mock: `handlers/china` 확장(3 핸들러)
- 사이드바: 기존 CHINA_SIDE_NAV 링크(#218에서 배선 완료)

## Parity 체크리스트
- [ ] 화면 요소 일치 (검색필터 2종·5컬럼·tfoot·등록 버튼·카운트 "명")
- [ ] 필드/검증 일치 (이름 LIKE·이메일 등호·등록 모달 required 3종)
- [ ] 분기/플로우 일치 (초기화 confirm→alert→미갱신 quirk·등록→invalidate·정렬 idx desc)
- [ ] 엣지케이스 일치 (번호 역순 20/page·tfoot 오늘 Ymd·빈 목록·delete UI 없음)
