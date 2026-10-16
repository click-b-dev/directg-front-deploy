# 어드민 — 회원(Member) · 게시판(Board)

> 대상: `pc/_Admin_/member/` (19파일) · `pc/_Admin_/board/` (27파일)
> 공통 인프라(세션 인증 `$_SESSION['admin']`, DB 2개 `$conn`/`$conn_dgkr`, admin_head+topbar+sidebar+footer 레이아웃, jQuery/Bootstrap5, `*_list`/`*_view`/`*_form`/`*_ps`/`*_json`/`*_excel` 파일 유형 규칙)은 별도 문서 참조. 여기서는 반복하지 않는다.
> 도메인 규칙 원천: [`MEMBER-LIFECYCLE.md`](../../../legacy-project/docs/MEMBER-LIFECYCLE.md), [`BOARD-CONTENT.md`](../../../legacy-project/docs/BOARD-CONTENT.md), [`NOTIFICATION-EMAIL.md`](../../../legacy-project/docs/NOTIFICATION-EMAIL.md). 아래 "정책·규칙"은 어드민 화면에서 실제 실행되는 동작만 기재하고 상세 계약은 위 문서로 교차링크한다.

## 공통 관찰 사항 (회원·게시판 모두 해당)

- **도메인 클래스 실제 위치**: 작업 지시의 `AdminMember.php`/`Member.php`/`Board.php`는 존재하지 않음. `src/classes/`는 autoload 대상이고 실제 회원 로직은 **`AdminV1`** 클래스(`getMemberList`, `getMemberInfo`, `getMemberNo`, `getMemberAge`, `getMemberSnsList`, `getMemberPointList`, `getMemberPoint`, `getMemberReadyList`, `getDirectSendMailLog`), 게시판 로직은 **`AdminBoard`** 클래스, 상품검색 보조는 **`Admin`** 클래스에 있음. 메일 발송은 **`DirectSendMail`** 클래스.
- **회원 포인트 계산**: 별도 잔액 컬럼 없음. `AdminV1::getMemberPoint()` = `SELECT SUM(amt_delta) AS point FROM tbl_emoney_log WHERE m_no = ?`. 즉 **포인트 잔액은 emoney_log 델타 합산으로 파생**된다.
- **DB 분리**: 회원 테이블 `tbl_member`·`sns_info`·`tbl_emoney_log`·`tbl_email_api`·`tbl_qna`·`tbl_survey*`는 `$conn_dgkr`(directgames/dgkr) 연결. 단, `dashboard_crm.php`는 `$conn`(메인) 연결에서 `directgames.*`를 크로스DB로 조회. 주문(`tbl_order*`)·공지/FAQ/자료실(`tbl_notice`/`tbl_faq`/`tbl_dataroom`)은 메인 `$conn`.
- **SQL 인젝션 주의**: 목록 필터 다수가 사용자 입력을 문자열 보간(`$where[] = " ... = '{$search_value}'"`)으로 조립. `member_list.php`의 정렬만 화이트리스트(`$sort_map`) 처리. 마이그레이션 시 파라미터 바인딩으로 재현하되 **동작(검색 결과) 동일성**을 우선한다.
- **에디터 혼재**: 게시판 위지윅은 화면마다 다르다. 공지/FAQ/자료실 등록은 **SimpleMDE(마크다운)**, QnA 답변 작성만 **smarteditor2**. (작업 배경의 "게시판 전반 smarteditor2" 전제와 다르므로 주의.)

---

## 회원

### 개요

어드민 회원 관리 범위: 회원 **조회/검색·상세·승인(승인대기)·탈퇴·본인인증 초기화·포인트 지급/차감·간편로그인(SNS) 연동현황·자동메일(발송로그/잔액)·CRM 대시보드**. 쿠폰/선물/라이선스 전용 어드민 화면은 이 디렉토리에 **미구현**(사이드바에서 주석 처리됨). 상세 생애주기·등급·제재 계약은 `MEMBER-LIFECYCLE.md` 참조.

회원 상세 진입점: `lib_func.php`의 `member_link($m_no)` → `member/member_view.php?m_no=`. 목록·포인트·문의 화면 곳곳에서 `member_view.php?m_no=` 로 상호 링크.

`status` 코드(대시보드 기준): `0`=정상회원, `5`=승인대기, `1`=탈퇴. `mem_level`: 1 일반 / 2 정회원 / 3 VIP. `mem_type`: P 일반 / R 리셀러 / S 휴면 / E 이벤트. `is_auth`: Y/N 본인인증. `mailling`: Y/N 메일수신동의.

### 메뉴 트리 (`inc/sidebar_member.php`)

- 회원 대시보드 → `member/dashboard_crm.php` (topbar 진입점)
- 회원 관리
  - 회원 리스트 → `member/member_list.php`
  - (숨김) 회원 상세 → `member/member_view.php`
  - 승인대기 리스트 → `member/member_list_ready.php`
  - 간편로그인 연동현황(NAVER) → `member/member_naver_list.php`
  - 간편로그인 연동현황(KAKAO) → `member/member_kakao_list.php`
  - 간편로그인 연동현황(PAYCO) → `member/member_payco_list.php`
  - (주석) 탈퇴완료/휴면예정/휴면리스트/보유포인트/보유쿠폰/블랙리스트 — 비활성
- 포인트 관리
  - 포인트 지급/차감 내역 → `member/member_point_list.php`
  - 포인트 지급/차감 → `member/member_point_form.php`
- 자동메일 관리
  - (주석) 가입/비번/탈퇴/등급변경/수신거부 자동메일 설정 — 비활성
  - 자동메일 잔액조회 → `member/directsend_remaining_emoney.php`
  - 자동메일발송 로그 → `member/directsend_mail_log.php`

### 페이지별 정의

#### 회원 대시보드 — `member/dashboard_crm.php`
- 유형: 대시보드(집계 view). topbar "회원 대시보드" 진입점.
- 기능: 전체 `tbl_member` 1회 스캔 집계 — 총회원/정상/리셀러/승인대기 카운트, 신규가입(오늘/주/월 + 기간별 승인대기), 등급 분포(lv1~3), 유형 분포(P/R/S), SNS 연동(`sns_info` sns_type별 distinct m_no), 활동성(log_date 기준 7/30/90일·1년+미접속·기록없음), 자동메일 현황(`tbl_email_api` 어제 이후 gubun별 발송/실패 `failed IN(1,4)`).
- 정책·규칙: 무거운 집계를 **세션 캐시 10분**(`$_SESSION['crm_dash']`), `?refresh=1` 강제 갱신. 분포 막대는 `pct()` 헬퍼(lib) 사용.
- 데이터소스: `$conn`(메인)에서 크로스DB `directgames.tbl_member`, `directgames.sns_info`, `directgames.tbl_email_api`.
- 폼필드·파라미터: `refresh`(GET).
- 연계: 발송로그 버튼 → `directsend_mail_log.php`.
- 참조: 등급/유형 정의 `MEMBER-LIFECYCLE.md`, 메일 gubun `NOTIFICATION-EMAIL.md`.

#### 회원 리스트 — `member/member_list.php`
- 유형: 목록(list) + 검색필터.
- 기능: 회원 조회. 각 행 아이디 → `member_view.php?m_no=`. 행 우측 **탈퇴** 버튼(AJAX → `member_proc.php` mode=leave).
- 정책·규칙: 정렬은 `sort/dir` 화이트리스트(`reg_date`/`log_date`)만 허용, 기본 가입일 DESC(리셀러 탭 R이면 최종로그인 DESC). 페이지당 30건. 전체건수 = `status=0` count.
- 데이터소스: `AdminV1::getMemberList()` (`$conn_dgkr`), `tbl_member(tm)`.
- 폼필드·파라미터(GET): `search_type`(m_id LIKE 접두 / name·nickname·hp·ip = / m_no =), `search_value`, `member_level`, `old_login`(N일 이상 미로그인 `DATEDIFF`), `mailling`(all/Y/N), `is_auth`(all/Y/N), `mem_type`(all/P/R/S/E), `start_reg_date~end_reg_date`, `start_log_date~end_log_date`, `sort`,`dir`,`page`.
- 연계: 탈퇴 → `member_proc.php`.
- 참조: `MEMBER-LIFECYCLE.md`.

#### 회원 상세보기 — `member/member_view.php`
- 유형: 상세(view) — 회원 정보 + 요약 지표 + 관련 내역.
- 기능: 회원 기본정보(고유번호/아이디/이메일/이름/닉네임/생년월일·나이/휴대폰/등급/가입일/최종로그인·IP/방문횟수/가입방법 SNS badge/유형/포인트/본인인증), 회원등급 변동이력(`tbl_member_level_history` 최근5), 결제완료·주문완료·취소완료 건수/금액 타일, 회원 주문내역(최근5, order_all 연결), 회원 문의내역(최근5, qna 연결). **본인인증 초기화** 버튼(is_auth=Y일 때, AJAX mode=authReset).
- 정책·규칙(개인정보): 인증 초기화 시 이름/휴대폰/생년월일/dupinfo/성별/auth_type 삭제 경고 confirm. 포인트 = `SUM(amt_delta)`.
- 데이터소스: `$pdo`(메인, 주문), `$pdo2`(dgkr, 회원). `AdminV1::getMemberInfo/getMemberPoint`, `AdminOrder::getOrderAll`, `AdminBoard::getQnaList`. 테이블: `tbl_member`, `tbl_emoney_log`, `tbl_member_level_history`, `tbl_order`/`tbl_order_item`, `tbl_qna`.
- 폼필드·파라미터: `m_no`(GET).
- 연계: `member_proc.php`(authReset), `member_point_list.php`(내역보기), `order/order_all.php`·`order_old_list.php`, `board/qna_list.php`·`qna_view.php`.
- 참조: 등급이력·인증 `MEMBER-LIFECYCLE.md`.

#### 회원 처리 (POST) — `member/member_proc.php`
- 유형: ps(JSON). `member_list`/`member_list_ready`/`member_view`에서 AJAX 호출.
- 기능·mode: `leave`(탈퇴: `tbl_member` status=1·out_date=NOW, `sns_info` 삭제, `tbl_log_hack`에 스냅샷 INSERT + admin_id) / `delete`(승인대기건 완전삭제: sns_info + tbl_member DELETE) / `apply`(가입승인: status=0) / `authReset`(본인인증 정보 NULL화·is_auth=N). 트랜잭션 begin/commit, 실패 rollback.
- 정책·규칙: `m_no` `FILTER_VALIDATE_INT` 필수. admin_id는 세션에서.
- 데이터소스: `$pdo`(dgkr). `tbl_member`, `sns_info`, `tbl_log_hack`.
- 참조: 탈퇴·감사로그 `MEMBER-LIFECYCLE.md`.

#### 승인대기 리스트 — `member/member_list_ready.php`
- 유형: 목록. `status=5` 대상.
- 기능: 승인대기 회원 조회, 행별 **가입승인**(mode=apply)·**삭제**(mode=delete) 버튼. 로그인 불가 국가 안내문 하드코딩(계정도용 사건 관련).
- 데이터소스: `AdminV1::getMemberReadyList()`(dgkr), `tbl_member` status=5.
- 폼필드: `search_type`(m_id LIKE / name / nickname), `search_value`, `page`. 페이지당 30.
- 연계: `member_proc.php`.

#### 간편로그인 연동현황 (NAVER/KAKAO/PAYCO) — `member/member_naver_list.php` · `member_kakao_list.php` · `member_payco_list.php`
- 유형: 목록 (동일 구조 3종, `sns_type` 값만 NAVER/KAKAO/PAYCO 상수 차이).
- 기능: 해당 SNS로 연동된 회원 목록(아이디/이메일/이름/닉네임/생년월일·나이/IP·country/방문횟수/연결구분/가입일/연동일자).
- 데이터소스: `AdminV1::getMemberSnsList()`(dgkr), `tbl_member(tm)` JOIN `sns_info(si)`, `WHERE tm.status=0 AND si.sns_type='...'`.
- 폼필드: 목록/검색 파라미터, `page`.
- 참조: SNS 로그인 `MEMBER-LIFECYCLE.md`.

#### 포인트 지급/차감 내역 — `member/member_point_list.php`
- 유형: 목록.
- 기능: 전체 포인트 지급/차감 이력(아이디/등급/구분/금액/일시/처리자 admin_id/사유 memo). 아이디 → `member_point_form.php`.
- 데이터소스: `AdminV1::getMemberPointList()`(dgkr), `tbl_emoney_log(tel)` (+행별 `getMemberInfo`로 아이디/등급 조회). 전체건수 = `m_no IS NOT NULL` count. 페이지당 50.
- 폼필드(GET): `search_type`(tm.m_id 고정), `search_value`(아이디→m_no 변환 후 조회), `emoney_type`(all/+/-), `page`.

#### 포인트 지급/차감 — `member/member_point_form.php`
- 유형: 폼(form) + 대상회원 검색.
- 기능: 아이디로 대상회원 검색 후 카드에 정보 표시, 지급/차감 폼(여부 radio·금액·사유 select). 클라이언트 검증(여부·금액·차감 시 보유포인트 초과 방지·사유 필수). 제출 AJAX → `member_point_proc.php`.
- 정책·규칙: `member_point`(현재 잔액) hidden으로 차감 상한 검증. 사유 select 고정 목록(discount/repay/refound/add_member_level/renewal/change/reward1~3/mobile_refund1~2/etc).
- 데이터소스: `AdminV1::getMemberNo/getMemberInfo/getMemberPoint`(dgkr), `tbl_member`, `tbl_emoney_log`.
- 폼필드(POST): `m_no`, `member_point`, `point_type`(add/sub), `point`, `memo_type`, `memo`.
- 연계: `member_point_proc.php`.

#### 포인트 처리 (POST) — `member/member_point_proc.php`
- 유형: ps(JSON).
- 기능·mode: `add`(INSERT tbl_emoney_log emoney_type='+', amt_delta=+point) / `sub`(emoney_type='-', amt_delta=-ABS(point)). memo_type→memo 문자열 매핑(서버 재검증). admin_id 세션. 트랜잭션.
- 정책·규칙: `m_no` INT 필수. `ordno`에 m_no 저장(관례).
- 데이터소스: `tbl_emoney_log`(dgkr).
- 참조: 포인트 정책 `MEMBER-LIFECYCLE.md`.

#### 자동메일 잔액조회 — `member/directsend_remaining_emoney.php`
- 유형: view(단순 조회).
- 기능: DirectSend(directsend.co.kr) 메일 API 잔액을 `DirectSendMail::remainingMoney()`로 조회 표시. 계정(dcpinter) 안내, 1건 0.5원 안내.
- 데이터소스: 외부 API(`DirectSendMail`).
- 참조: `NOTIFICATION-EMAIL.md`.

#### 자동메일발송 로그 — `member/directsend_mail_log.php`
- 유형: 목록.
- 기능: 자동메일 발송 로그(발송유형/구분 join·password·qna/발송대상 email/발송일시/result/실패여부/state/오류 SmtpMsg).
- 데이터소스: `AdminV1::getDirectSendMailLog()`(dgkr), `tbl_email_api(tea)`. 페이지당 50.
- 폼필드(GET): `gubun`(all/join/password/qna), `failed`(all/0/1 → 1은 `failed IN(1,4)`), `search_type`(tea.email), `search_value`, `page`.
- 참조: 발송 gubun·state 코드 `NOTIFICATION-EMAIL.md`.

#### 회원 탈퇴 요청 — `member/member_leave_request.php`
- 유형: 미구현 스텁(레이아웃만, 카드 body 비어있음). 사이드바 미노출.

---

## 게시판

### 개요

게시판 종류: **공지사항(notice)**, **자주묻는질문(FAQ)**, **문의하기(QnA, 1:1)**, **자료실(dataroom)**, **설문조사(survey)**. 게시판 대시보드(`dashboard_board.php`)는 topbar 진입점이나 **본문 미구현 스텁**. 상세 콘텐츠 규칙은 `BOARD-CONTENT.md` 참조.

에디터: 공지/FAQ/자료실 등록은 **SimpleMDE(마크다운, `contents`/`answer`/`contents` textarea)**, QnA 답변만 **smarteditor2**. 저장 시 `HTMLToMarkdown\HtmlConverter`(copy 모드) / `Parsedown`(조회 렌더) 혼용.

### 메뉴 트리 (`inc/sidebar_board.php`)

- 대시보드 → `board/dashboard_board.php` (topbar 진입점)
- 공지사항 관리
  - (주석) `notice_list_dgkr.php`
  - 공지사항 목록 → `board/notice_list.php`
  - 공지사항 등록 → `board/notice_register.php`
- 자주묻는질문 관리
  - 자주묻는질문 목록 → `board/faq_list.php`
  - 자주묻는질문 등록 → `board/faq_register.php`
- 문의하기 관리
  - 문의하기 목록 → `board/qna_list.php`
  - (숨김) 문의하기 상세 → `board/qna_view.php`
  - (숨김) 답변 작성 → `board/qna_register.php`
- 자료실 관리
  - 자료실 파일현황 → `board/dataroom_file.php`
  - 자료실 다운로드현황 → `board/dataroom_download.php`
- 설문조사 관리
  - 설문조사 목록 → `board/survey_list.php`
  - (숨김 d-none) 등록/결과보기 → `survey_register.php`·`survey_result.php`·`survey_result_etc.php`·`survey_result_user.php`

### 페이지별 정의

#### 게시판 대시보드 — `board/dashboard_board.php`
- 유형: 미구현 스텁(레이아웃만). topbar 진입점.

#### 공지사항 목록 — `board/notice_list.php`
- 유형: 목록.
- 기능: 공지 조회(고유번호/구분 notice_type/제목(is_notice=Y면 "공지" badge)/작성·수정일/배포일/노출 is_view/조회수 hit). 행별 상세·수정 링크, 삭제(AJAX `notice_ps.php` mode=delete). 정렬 deploy_date DESC.
- 데이터소스: `AdminBoard::getNoticeList()`(메인 `$conn`), `tbl_notice`.
- 폼필드(GET): `search_notice_type`(1 제품코드발송/2 프로모션/3 상품출시/4 기타), `search_title`(subject LIKE), `page`.
- 참조: `BOARD-CONTENT.md`.

#### 공지사항 등록 — `board/notice_register.php`
- 유형: 폼(등록/수정 겸용, `idx>0`이면 modify).
- 기능: 구분 radio, 제목, 내용(**SimpleMDE**), 고정여부 is_notice, 노출여부 is_view, 배포일자 deploy_date(timepicker). 저장 → `notice_ps.php`.
- 데이터소스: `tbl_notice`(메인).
- 폼필드(POST): `mode`, `idx`, `notice_type`, `subject`, `contents`, `is_notice`, `is_view`, `deploy_date`.

#### 공지사항 처리 (POST) — `board/notice_ps.php`
- 유형: ps.
- 기능·mode: `regitster`(오타 그대로, INSERT admin_id 하드코딩 "admin@h2int.com") / `modify`(UPDATE) / `delete`(DELETE) / `copy`(dgkr `tbl_notice`→메인, `HtmlConverter`로 HTML→MD 변환, 원본 is_chk='Y') / `product_search`(연관상품 검색 HTML echo, `Admin::getNoticeProductSearch`) / `product_add`(`tbl_notice_goods` INSERT).
- 정책·규칙: contents `<`,`>`,`&` 수동 escape 후 저장(XSS 완화). 저장 후 `go('notice_list.php')`.
- 데이터소스: `tbl_notice`, `tbl_notice_goods`, `tbl_goods_item`(메인+dgkr).

#### 공지사항 상세 — `board/notice_view.php` / `board/yjs_notice_view.php`
- 유형: 상세 view (2개 거의 동일, `yjs_` 변형). `Parsedown`으로 contents 렌더, `tbl_notice_goods` JOIN `tbl_goods_item`으로 연관상품 표시.
- 데이터소스: `tbl_notice`, `tbl_notice_goods`, `tbl_goods_item`(메인).

#### [DGKR] 공지사항 목록 — `board/notice_list_dgkr.php`
- 유형: 목록 변형(사이드바 주석 비활성). `getNoticeList` dgkr 대상. 나열만.

#### 자주묻는질문 목록 — `board/faq_list.php`
- 유형: 목록. `Parsedown` 답변 렌더.
- 데이터소스: `AdminBoard::getFaqList()`, `tbl_faq`.
- 폼필드(GET): `search_item_cd`, `search_subject`, `page`.

#### 자주묻는질문 등록 — `board/faq_register.php`
- 유형: 폼(register/modify). 질문/답변(**SimpleMDE**), faq_type. 저장 → `faq_ps.php`.
- 데이터소스: `tbl_faq`.

#### 자주묻는질문 처리 (POST) — `board/faq_ps.php`
- 유형: ps. mode: `register`/`modify`/`copy`(대량 faq_type 매핑 switch 후 INSERT, `HtmlConverter` 사용)/`delete`.
- 데이터소스: `tbl_faq`.
- 참조: FAQ 분류 `BOARD-CONTENT.md`.

#### 문의하기 목록 — `board/qna_list.php`
- 유형: 목록(1:1 문의).
- 기능: QnA 조회(구분 gubun/제목(첨부 있으면 아이콘)/작성자 user_id/작성일/답변상태/고객확인 replyStatus/메일발송 email_flag). 제목 → `qna_view.php`. **읽은 글 표시는 localStorage**(`qna_read_ids`)로 클라이언트 처리. 다중선택 삭제(POST `qna_ps.php` mode=delete).
- 데이터소스: `AdminBoard::getQnaList()`(dgkr), `directgames.tbl_qna` + `tbl_file` 첨부수 서브쿼리. 페이지당 30.
- 폼필드(GET): `searchType`(subject/user_id/contents/subject_contents)+`searchTitle`, `searchGubun`(1~9), `is_answer`(all/N/Y), `replyStatus`(all/1/0), `email_flag`(all/Y/N), `page`.
- 참조: `BOARD-CONTENT.md`, `NOTIFICATION-EMAIL.md`.

#### 문의하기 상세 — `board/qna_view.php`
- 유형: 상세 view.
- 기능: 문의 내용/첨부이미지(`/upload/qna/`, reg_date>2025-08-19면 절대 URL `https://directg.net`)/답변 표시, 동일 user_id 문의 이력 목록, 회원정보/주문/취소내역 바로가기, **답변하기**(→qna_register), 답변 완료(is_answer=Y)면 **메일발송**(AJAX `qna_ps.php` mode=mail).
- 데이터소스: `tbl_qna`, `tbl_file`(table_name='tbl_qna'), `AdminV1::getMemberNo/getMemberInfo`(dgkr).
- 폼필드: `idx`(GET).
- 연계: `qna_register.php`, `qna_ps.php`, `member/member_view.php`, `order/*`.

#### 문의하기 답변 작성 — `board/qna_register.php`
- 유형: 폼(답변). **smarteditor2 위지윅**(`smarteditor2/js/service/HuskyEZCreator.js`, 스킨 `SmartEditor2Skin.html`). 저장 시 `oEditors.getById["answer"].getIR()` → hidden answer → `qna_ps.php` mode=update.
- 데이터소스: `tbl_qna`, `tbl_file`.
- 폼필드(POST): `mode`(update), `idx`, `answer`.
- 유의: 이 화면만 smarteditor2 사용. 마이그레이션 시 대체 에디터 필요.

#### 문의하기 처리 (POST) — `board/qna_ps.php`
- 유형: ps.
- 기능·mode: `update`(답변 저장: answer·answer_dt=NOW·admin_id·is_answer='Y', `htmlspecialchars` escape, `go(HTTP_REFERER)`) / `delete`(다중 idx `FIND_IN_SET` DELETE) / `mail`(문의답변 메일: `conf/email/email_qna.php` 템플릿 로드 → `DirectSendMail::sendMail`, 성공 시 email_flag='Y'·email 저장).
- 데이터소스: `tbl_qna`(dgkr), 외부 DirectSend API.
- 참조: 메일 발송 `NOTIFICATION-EMAIL.md`.

#### 자료실 파일현황 — `board/dataroom_file.php`
- 유형: 목록.
- 기능: 자료실 파일(파일유형 P 한글패치/컨텐츠, 제공파일명, 암호화 is_encode/encode_type, 제공조건 is_free 유·무료, 배포일, 다운로드 수, 상세/수정/다운로드). 등록 버튼 → `dataroom_register.php`.
- 데이터소스: `AdminBoard::getDataroomList()`(메인), `tbl_dataroom` LEFT JOIN `tbl_dataroom_log`(다운로드 합계). 페이지당 30.
- 유의: 하단 삭제 스크립트가 `notice_ps.php`를 호출(레거시 버그성 잔재, 동작 동일 재현).

#### 자료실 파일 등록 — `board/dataroom_register.php`
- 유형: 폼(register/modify). 파일유형/파일명/파일URL/썸네일 업로드/설명(**SimpleMDE**)/암호화 여부·방식/배포일/제공조건/노출. 저장 → `dataroom_ps.php`.
- 데이터소스: `tbl_dataroom`.

#### 자료실 파일 상세 — `board/dataroom_view.php`
- 유형: 상세 view. `Parsedown` 렌더, 제공상품(`Admin::getProductPlatform/getPublisherName`) 표시.
- 데이터소스: `tbl_dataroom` (+상품 조인).

#### 자료실 처리 (POST) — `board/dataroom_ps.php`
- 유형: ps. mode: `register`/`modify`(`Dataroom::setDataroom/updateDataroom` 호출)/`product_search`/`product_add`. 썸네일 `move_uploaded_file`로 저장.
- 데이터소스: `tbl_dataroom`(+상품 매핑). 파일 업로드 → 디스크.
- 유의(첨부): `move_uploaded_file` 실파일 업로드. 마이그레이션 시 스토리지 처리 필요.

#### 자료실 다운로드현황 — `board/dataroom_download.php`
- 유형: 목록. 회원별 파일 다운로드 로그(m_no/m_id/download_count).
- 데이터소스: `AdminBoard::getDataroomDownloadList()`, `tbl_dataroom_log` JOIN `tbl_dataroom`.

#### 설문조사 목록 — `board/survey_list.php`
- 유형: 목록. 응답수(`getSurveyCount`)/정원(max_people 0=무제한) 표시.
- 데이터소스: `AdminBoard::getSurveyList()`(dgkr), `tbl_survey`.

#### 설문조사 등록 — `board/survey_register.php`
- 유형: 폼(등록/수정, 429L 대형). 문항·보기 동적 구성. 저장 → `survey_ps.php`.
- 데이터소스: `tbl_survey`, `tbl_survey_question`, `tbl_survey_question_item`.

#### 설문조사 처리 (POST) — `board/survey_ps.php`
- 유형: ps. `tbl_survey`/`tbl_survey_question`/`tbl_survey_question_item` INSERT·UPDATE·DELETE(수정 시 기존 문항/보기 삭제 후 재삽입).
- 데이터소스: `tbl_survey*`.

#### 설문조사 결과보기 — `board/survey_result.php`
- 유형: 결과 집계 view. 문항별 보기 응답수(`getAnswerCount`), '기타'(answer=100) 카운트.
- 데이터소스: `tbl_survey_answer` 등.

#### 설문조사 '기타' 결과 — `board/survey_result_etc.php` / `survey_result_etc_excel.php`
- 유형: 주관식('기타', answer=100) 응답 목록 view / **CSV 다운로드**(`survey_result_etc_excel.php`는 `Content-Type: text/csv` + `Content-Disposition attachment`, `getEtcAnswerList(..., excel=true)`). PHPExcel 아님, CSV echo.
- 데이터소스: `AdminBoard::getEtcAnswerList()`, `tbl_survey_question`/`tbl_survey_answer`.

#### 설문조사 '사용자별' 결과 — `board/survey_result_user.php`
- 유형: 사용자별 응답 매트릭스 view(362L). `getUserAnswerList`/`getUserAnswerInfo`.
- 데이터소스: `tbl_survey_answer` JOIN 회원.

#### 설문조사 템플릿 — `board/survey_template.php`
- 유형: 문항 추가용 HTML 템플릿(JS include 대상, 91L). 나열만.

---

## 변형/테스트 파일

- **미구현 스텁**(레이아웃만, 본문 없음): `member/member_leave_request.php`, `member/member_sleep_list.php`, `member/member_sleep_ready.php`, `member/member_leave_list.php`, `board/dashboard_board.php`.
- **0바이트 빈 파일**: `member/member_group_list.php`, `member/mail_config_auto.php`.
- **DGKR 변형**(사이드바 주석 비활성): `board/notice_list_dgkr.php`.
- **거의 동일 3종**(sns_type 상수만 차이): `member/member_naver_list.php` / `member_kakao_list.php` / `member_payco_list.php`.
- **상세 view 변형**: `board/notice_view.php` ↔ `board/yjs_notice_view.php`(`yjs_` 접두, 거의 동일).
- **템플릿/부분 include**: `board/survey_template.php`.

## 마이그레이션 유의점

- **개인정보 취급**: 회원 상세/목록은 이름·휴대폰·생년월일·IP·이메일 노출. 본인인증 초기화(`authReset`)는 개인정보 삭제 동작 — 감사로그(탈퇴 시 `tbl_log_hack` 스냅샷) 포함해 동일 재현. 어드민 권한(admin_level) 게이트는 공통 인프라 문서 참조.
- **포인트 = 로그 합산**: 잔액 컬럼 없음. `SUM(amt_delta)` 파생 로직을 그대로 이식(별도 balance 컬럼 도입은 회귀).
- **에디터 대체**: smarteditor2(QnA 답변)와 SimpleMDE(공지/FAQ/자료실)를 구분해 대체. 저장 포맷(HTML vs Markdown), 조회 렌더(`Parsedown`), copy 시 `HtmlConverter` 변환 동작까지 결과 동일성 유지.
- **첨부파일**: QnA 첨부는 `tbl_file`(table_name='tbl_qna', puid=idx) + `/upload/qna/` 경로. reg_date>2025-08-19 기준 도메인 절대경로 분기 로직 존재. 자료실은 `move_uploaded_file` 썸네일 업로드. 스토리지 이관 필요.
- **CSV 익스포트**: 설문 '기타' 엑셀은 실제 CSV(text/csv) echo. 스프레드시트 라이브러리 아님.
- **크로스DB / 하드코딩**: `dashboard_crm.php`는 `$conn`에서 `directgames.*` 크로스DB 조회. `notice_ps.php` copy/regitster admin_id "admin@h2int.com" 하드코딩. `regitster`(오타) mode 값 그대로 유지해야 폼과 매칭됨.
- **SQL 인젝션 잔재**: 필터 문자열 보간을 파라미터 바인딩으로 옮기되 검색 동작(LIKE 접두/부분, = 매칭)은 화면별로 상이하므로 각 파일 규칙대로 재현.
- **참조 문서**: `MEMBER-LIFECYCLE.md`(회원 생애주기·등급·포인트·탈퇴), `BOARD-CONTENT.md`(게시판 종류·FAQ 분류·공지 구분), `NOTIFICATION-EMAIL.md`(DirectSend 발송·gubun·state·잔액).
