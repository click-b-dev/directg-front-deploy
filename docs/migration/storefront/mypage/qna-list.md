# 문의 내역 (mypage/qna)

## 원본
- 파일: `pc/mypage/mypage_qna.html` (+ `mypage_qna_proc.php` mode=view)
- 도메인 클래스: `src/classes/Mypage.php::getqnaList` (dgkr DB) + `Parsedown`
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/BOARD-CONTENT.md`, `MEMBER-LIFECYCLE.md`
- 선례: `entities/mypage-point`(세션 목록+쿠키), `screens/board-faq`(아코디언 collapse), `widgets/mypage-aside`

## 화면·플로우
- 진입 URL: `/mypage/mypage_qna.html`, GET `?page=N`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > aside_mypage + `section#content.content.rounded-0.font-14`
- 화면 요소: `card.mb-0.shadow-none.rounded-0.text-center`
  - `card-header.border-bottom.accordion...` > `row.fw-bold`: 구분(col-2)/제목(col-6)/작성일자(col-2)/답변여부(col-2)
  - `card-body.py-0.text-nowrap`: 행 반복
    - `row.border-top.py-2.align-items-center`: 구분(qnaGubun 라벨) + 제목(col-6 text-start text-wrap) + reg_date + 답변여부 버튼
    - 답변여부: `is_answer=="Y"` → `button.btn-sm.btn-primary.w-75.btn-show-answer`(답변보기) / else `button.btn-sm.btn-dark.w-75`(답변대기중). 둘 다 `data-bs-toggle=collapse data-bs-target=#collapse-{i}`
    - `div#collapse-{i}.collapse.text-start` > `card-body.mb-3`: h4 "문의내용" + 카드(contents Parsedown) + hr + h4 "답변" + 카드(is_answer=Y? decode(answer) : "답변 대기중 입니다.")
    - 빈 목록: `total_results=="0"` → `div.p-3` "등록된 문의가 없습니다."
  - 페이지네이션 `div#pagination.mt-4`(links_html)
- 인터랙션: 답변보기(is_answer=Y) 클릭 **펼침 시** `POST mypage_qna_proc.php {idx, mode:view}` fire-and-forget → `UPDATE tbl_qna SET replyStatus=1`(답변 읽음). 답변대기중은 로그 없음. 아코디언은 Bootstrap collapse(data 속성).
- 세션/권한: **로그인 필수**(목록·조회로그 모두)

## 데이터 (legacy)
- `getqnaList`: `SELECT idx,subject,reg_date,answer_dt,is_answer,gubun,contents,answer FROM tbl_qna WHERE user_id='{m_id}' ORDER BY reg_date DESC` (20/page)
- contents: `htmlspecialchars_decode(Parsedown(contents))`, answer: `htmlspecialchars_decode(answer)`(Parsedown 아님)
- qnaGubun(9): 6 계정,회원,인증 / 7 한글,제공 콘텐츠 / 1 게임 설치,플레이 / 2 주문,결제 / 4 주문취소 및 환불 / 3 기타 / 5 제품 코드(키) 오류 / 8 할인,가격 / 9 이용방법
- `mode=view`: `UPDATE tbl_qna SET replyStatus=1 WHERE idx AND user_id`

## API 계약 (백엔드 전달)
- `GET /api/mypage/qna?page=N` (세션 쿠키) → `{ list: QnaRow[]; page; totalPages }`
  - `QnaRow { idx, gubun, subject, reg_date, is_answer, contents_html, answer_html }`
  - 백엔드: `user_id=세션회원`, `reg_date DESC`, 20/page, contents=`htmlspecialchars_decode(Parsedown())`, answer=`htmlspecialchars_decode()`
- `POST /api/mypage/qna/view` body `{ idx }` (세션) → `replyStatus=1` 업데이트 (fire-and-forget)
- 응답 타입: `entities/mypage-qna/model/types.ts`. qnaGubun은 프론트 표시 상수.

## 타겟 매핑
- 라우트: `app/mypage/mypage_qna.html/page.tsx` → `/mypage/mypage_qna.html` (searchParams page, `requireMemberSession()` 가드)
- screen: `screens/mypage-qna` (server) — 아코디언·qnaGubun 맵, contents/answer `dangerouslySetInnerHTML`
- 컴포넌트: `screens/mypage-qna/ui/qna-view-button.tsx` (`'use client'`) — 답변보기 버튼(펼침 시 view 로그 fetch)
- entities: `entities/mypage-qna` (`getMypageQna` server, `postMypageQnaView` client)
- widget: `widgets/mypage-aside`(기존) active=qna
- mock: `shared/mocks/fixtures/mypage-qna.ts` + handler `GET */api/mypage/qna`, `POST */api/mypage/qna/view`

## 단위 경계 결정 / quirk
1. 답변보기만 조회로그(replyStatus=1) — 펼침 시 1회. React 로컬 expanded 상태로 "펼침 전환" 판정(legacy aria-expanded 체크 재현). 답변대기중은 로그 없음.
2. contents=Parsedown / answer=decode만 → 백엔드 contents_html/answer_html. is_answer=N이면 프론트가 "답변 대기중 입니다." 표시.
3. Bootstrap collapse data 속성(전역 번들). collapse-{index} 0-base.
4. 검색 UI 없음(search_goods_name filter_input만 존재, 폼 없음). 페이지네이션 `?page=N`만.
5. qnaGubun 9종 프론트 상수.
6. register 모드(파일업로드/메일)는 문의하기(mypage_qna_register) 단위 소관 — 이 단위 제외.

## Parity 체크리스트
- [ ] aside_mypage(문의 내역 active) + 카드 헤더(구분/제목/작성일자/답변여부)
- [ ] 행: 구분 라벨 + 제목 + reg_date + 답변보기/답변대기중 버튼
- [ ] collapse: 문의내용(Parsedown) + 답변(decode 또는 "답변 대기중 입니다.")
- [ ] 답변보기 펼침 시 view 로그 POST(fire-and-forget)
- [ ] 빈 목록 "등록된 문의가 없습니다."
- [ ] 페이지네이션 / SEO(title 문의 내역/viewport/description 빈값/author H2interactive)
