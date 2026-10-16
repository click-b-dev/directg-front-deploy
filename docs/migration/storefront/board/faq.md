# 자주묻는질문 (board/faq)

## 원본
- 파일: `pc/board/faq.html` (라이브 — 헤더/푸터/aside "자주묻는질문" 링크)
- 도메인 클래스: `src/classes/Board.php::getFaqList` + `Parsedown`
- 공통 aside: `pc/inc/aside_customer.html` (title "고객지원", faq/문의하기 2항목, 자료실 주석)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/BOARD-CONTENT.md`
- 선례: `entities/board-notice`·`widgets/service-aside`(→`SiteAside` 셸)·`ServerPagination`

## 화면·플로우
- 진입 URL/파라미터: `/board/faq.html`, GET `?page=N&searchValue=S`
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(grid 240px auto) > `aside_customer` + `section#content.content.rounded-0`
- 화면 요소:
  - 검색: `div.row > col-12 > form GET` > `div.mb-3.input-group.rounded-0` > `input.form-control.form-control-lg.rounded-0[name=searchValue][placeholder=궁금하신 점이 있다면 여기서 먼저 찾아보세요]` + `button.btn.btn-lg.btn-secondary.rounded-0` "자주묻는질문 검색"
  - `div.card.mb-0.shadow-none.rounded-0.text-center.font-14`
    - `div.card-header.border-bottom.accordion...` > `div.row.fw-bold` (col-2 "구분" / col-10 "제목")
    - `div.card-body.py-0.text-wrap`: FAQ 행 반복
      - 토글: `div.row.border-top.py-2.align-items-center[data-bs-toggle=collapse][data-bs-target=#collapse-{i}][aria-expanded=false][aria-controls=#collapse-{i}][data-idx={idx}]` > `div.col-2`(faq_type 라벨) + `div.col-10.text-start.text-wrap.cursor-pointer`(question HTML)
      - 답변: `div#collapse-{i}.collapse.text-start` > `div.card-body.m-5`(answer HTML)
    - 페이지네이션 `div#pagination.mt-4`(links_html)
    - (주석 dl 카테고리 버튼 그룹 — 미렌더)
- 아코디언: Bootstrap collapse **data 속성**(전역 번들 JS) — 클라이언트 컴포넌트 불필요, SSR + `data-bs-toggle`
- 폼: 질문 검색(GET searchValue). 세션/권한: **없음**(비로그인)

## 데이터 (legacy)
- `Board::getFaqList`: `select * from tbl_faq where 1=1 [add_where] order by [orderby]`, orderby `faq_type asc`, 20/page
- `add_where`: searchValue 있으면 ` and question like '%S%'`
- question/answer: `htmlspecialchars_decode($parsedown->text($value))` → 마크다운 HTML
- faq_type_label(16): M01 계정,회원 / M02 포인트 / O01 주문,결제 / O02 제품 코드(키) / O03 취소,환불 / O04 가격 / O05 할인 / G01 상품 / G02 구성,DLC / G03 특전 / G04 한글 / S01 이용방법 / S02 게임 등록 / S03 게임 설치 / S04 게임 실행 / E01 기타
- **legacy 버그**: 빈 목록 체크가 `$qna_list->total_results`(미정의 변수) → 항상 falsy → "등록된 문의가 없습니다." **절대 안 뜸**. 타겟도 빈 상태 메시지 미렌더로 재현.
- **quirk**: 페이지네이션 `$param` 미정의 → 검색어 미포함(`?page=N`만) — notice와 동일

## API 계약 (백엔드 전달)
- `GET /api/board/faqs?page=N&searchValue=S` → `{ list: FaqRow[]; page; totalPages }`
  - `FaqRow { idx: number; faq_type: string; question_html: string; answer_html: string }`
  - 백엔드 책임: `question LIKE '%S%'` 검색, `order by faq_type asc`, 20/page, question/answer에 `htmlspecialchars_decode(Parsedown())` 적용
- 응답 타입: `entities/board-faq/model/types.ts`. faq_type_label은 프론트 표시 상수.

## 타겟 매핑
- 라우트: `app/board/faq.html/page.tsx` → `/board/faq.html` (searchParams page/searchValue)
- screen: `screens/board-faq` (faq_type_label 맵, question/answer `dangerouslySetInnerHTML`)
- entities: `entities/board-faq` (`getBoardFaqs`)
- widget: `widgets/customer-aside` (신규, `SiteAside` 셸 — title "고객지원", faq/문의하기; 자료실 주석 미포함) active=faq
- 공용: `shared/ui/server-pagination`(baseUrl `/board/faq.html`, params 없음=검색어 미포함 quirk)
- mock: `shared/mocks/fixtures/board-faqs.ts` + handler `GET */api/board/faqs`

## 단위 경계 결정 / quirk
1. `aside_customer` → `widgets/customer-aside`(SiteAside 셸 재사용). 자료실 항목 주석 → 미포함.
2. question/answer 마크다운은 백엔드(question_html/answer_html). 프론트 raw HTML 렌더.
3. faq_type_label 16종 프론트 상수.
4. 빈 목록 메시지 미렌더(legacy 버그 재현).
5. 페이지네이션 검색어 유실(quirk) 재현.
6. 아코디언 collapse-{index}(0-base 순번)·data-idx={idx} 유지, Bootstrap data 속성.
7. legacy card 내부 div 개수 불균형(브라우저 자동보정)은 JSX 균형 구조로 시각 동일하게 정리.

## Parity 체크리스트
- [ ] aside_customer(고객지원, 자주묻는질문 active + 문의하기) 표시
- [ ] 검색폼(placeholder·버튼 라벨) 일치
- [ ] 카드 헤더(구분/제목) + FAQ 행(구분 라벨 + 질문) + collapse 답변
- [ ] 아코디언 토글 동작(Bootstrap collapse)
- [ ] 페이지네이션(검색어 미포함 quirk)
- [ ] 빈 목록 메시지 미출력(버그 재현)
- [ ] SEO(title 자주묻는질문/viewport/description/author H2interactive)
