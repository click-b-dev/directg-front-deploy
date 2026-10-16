# 게시판 영역 기반 (사이드바 전환 + 대시보드 스텁)

> 게시판(board) 도메인의 부트스트랩 단위. goods가 #17에서 사이드바 영역을 부트스트랩한 것과 동일 패턴.
> topbar `board` 메뉴(`/board/dashboard_board`)는 이미 존재(#3 topbar 단위에서 이식됨). 이 단위는 **사이드바 영역 전환 + BOARD_SIDE_NAV + 대시보드 스텁 화면**을 추가한다.

## 원본
- 파일:
  - `pc/_Admin_/inc/sidebar_board.php` — 게시판 사이드바(라이브 버전, 변형 없음)
  - `pc/_Admin_/board/dashboard_board.php` — 게시판 대시보드(미구현 스텁, 라이브 버전)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§게시판), `../legacy-project/docs/BOARD-CONTENT.md`

## 화면·플로우

### 사이드바 (`sidebar_board.php`)
- 로고 + `side-nav` 목록. 각 페이지가 `$sidebar_file = "sidebar_board.php"`로 선택 → 타겟은 경로 area(`/board`)로 매핑.
- 구성(주석/숨김 제외):
  - **대시보드** (link, icon `uil uil-dashboard font-22`) → `/board/dashboard_board`
  - **공지사항 관리** (group, icon `uil-shop`, id `sidebarNotice`)
    - 공지사항 목록 → `/board/notice_list`
    - 공지사항 등록 → `/board/notice_register`
  - **자주묻는질문 관리** (group, `uil-shop`, id `sidebarFaq`)
    - 자주묻는질문 목록 → `/board/faq_list`
    - 자주묻는질문 등록 → `/board/faq_register`
  - **문의하기 관리** (group, `uil-shop`, id `sidebarQna`)
    - 문의하기 목록 → `/board/qna_list`
  - **자료실 관리** (group, `uil-shop`, id `sidebarDataroom`)
    - 자료실 파일현황 → `/board/dataroom_file`
    - 자료실 다운로드현황 → `/board/dataroom_download`
  - **설문조사 관리** (group, `uil-shop`, id `sidebarSurvey`)
    - 설문조사 목록 → `/board/survey_list`
- 그룹 펼침: 모든 그룹 `class="collapse show"` → `expandAll: true` (site 사이드바와 동일 정책).
- **제외 항목**(legacy 미노출):
  - `[DGKR] 공지사항 목록`(`notice_list_dgkr.php`), `[DGKR] 자주묻는질문 목록`(`faq_list_dgkr.php`) — **HTML 주석**(`<!-- -->`) 처리 → nav.ts 컨벤션대로 미포함.
  - 문의하기 상세(`qna_view.php`), 답변 작성(`qna_register.php`) — `style="display:none"` 숨김 → 미포함(리스트에서 링크 진입, 사이드바 항목 아님).
  - 설문조사 등록/결과보기 4종 — `class="d-none"` 숨김 → 미포함.

### 대시보드 (`dashboard_board.php`)
- **미구현 스텁**: page-title-box(breadcrumb `홈 / 게시판 / 대시보드`, h4 `대시보드`) + 빈 카드 1개(`card > card-body` 내용 없음). 데이터/API 없음.
- `$page_title = "게시판 대시보드"`, `$topmenu['board'] = "active"`.

## legacy 버그/quirk (그대로 관찰, 이식 판단은 아래)
- **사이드바 그룹 id 중복**: `sidebar_board.php`에서 **자료실 관리**와 **설문조사 관리** 두 그룹이 모두 `id="sidebarDataroom"`, `href="#sidebarDataroom"` 사용(설문조사 그룹이 자료실 그룹 복붙 잔재). Bootstrap collapse에서 두 토글이 동일 selector를 가리켜 설문조사 토글이 자료실 collapse를 제어하는 오작동.
  - **이식 방침**: 초기 렌더 상태(두 그룹 모두 `collapse show`로 펼침)는 동일하게 재현. React 상태/DOM id는 유니크(`sidebarDataroom` / `sidebarSurvey`)로 부여해 각 그룹이 독립 토글되도록 한다. 중복 id는 명백한 복붙 오타이고, 깨진 토글 동작을 보존할 실익이 없어 **유니크화**(초기 표시 상태는 legacy 동일). → parity 보고서에서 개발자 확인 대상으로 명시.
- 대시보드 breadcrumb의 `홈`/`게시판` 링크는 `href="javascript: void(0);"`(비활성) — 타겟에선 `href="#"` + `preventDefault`로 이식(#15 operation-service 동일 방식).

## 데이터 (legacy)
- 없음. 대시보드는 스텁, 사이드바는 정적.

## API 계약 (백엔드 전달)
- 없음. (데이터 페칭/뮤테이션 없음)

## 타겟 매핑
- 라우트: `/board/dashboard_board` (신규 `routes/board/dashboard_board.tsx`)
- 스크린: 신규 `screens/board-dashboard`
- 사이드바: `widgets/sidebar/model/nav.ts` — `BOARD_SIDE_NAV` 신규 + `resolveSideNav`에 `/board` area 추가
- topbar: 기존 `board` 메뉴 재사용(변경 없음)
- entities/mock: 없음

## Parity 체크리스트
- [ ] 사이드바: 대시보드 link + 5개 그룹, 라벨/링크/아이콘/펼침 상태 legacy 일치
- [ ] 사이드바: `[DGKR]`/`display:none`/`d-none` 항목 미노출 일치
- [ ] 대시보드: breadcrumb(홈/게시판/대시보드) + h4(대시보드) + 빈 카드 1개 일치
- [ ] topbar `게시판` active 상태(`/board` 진입 시) 일치
- [ ] document.title = "게시판 대시보드"
