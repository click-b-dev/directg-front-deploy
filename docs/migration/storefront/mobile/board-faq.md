# 모바일 자주묻는 질문 (board/faq)

> legacy `mobile/board/faq.html` → `/m/board/faq.html`. PC 대응(`docs/migration/storefront/board/faq.md`, `entities/board-faq`) **재사용**(증분 없음).

## 원본 (legacy mobile)
- 파일: `mobile/board/faq.html` (180줄) — `Board::getFaqList($page, $add_where, "idx desc", $param)`, 20/page.
- PC 대응: `entities/board-faq` `getBoardFaqs(page, searchValue?)` `{list: FaqRow[], page, totalPages}`. FaqRow: idx, faq_type, question_html, answer_html.

## 화면·플로우 (legacy mobile 기준)
- 진입: `/board/faq.html?page=N&searchValue=S&search_faq_type=T` (빈 page → 1).
  - **search_faq_type**: where에 반영하나 **UI 없음**(URL로만) → 모바일 화면엔 미사용(PC 엔티티도 미지원).
- 셸: `sub_header`(pageTitle="자주묻는 질문") + `appCapsuleSub`(inline `padding-top:56px`).
- **extraHeader 검색폼**: `form.search-form#search-form[method=GET]` > `div.form-group.searchbox` > `input.form-control[name=searchValue, value={searchValue}, placeholder="검색어를 입력해 주세요."]` + `i.input-icon > ion-icon search-outline`. (제출 버튼 없음 — enter GET 제출.)
- `section full mt-2`:
  - **빈 목록**: `total_results=="0"`이면 `section full mt-2 > div.text-center.mb-2 "검색된 게시물이 없습니다."` (모바일은 빈 메시지 **정상 렌더** — PC는 legacy 버그로 미출력).
  - **아코디언** `div.accordion#accordionExample1`: faq마다 `accordion-item > h2.accordion-header > button.accordion-button.collapsed[data-bs-toggle=collapse, data-bs-target=#accordion{idx}, aria-expanded=false] "[{faq_type_label}] {question}"` + `div#accordion{idx}.accordion-collapse.collapse[data-bs-parent=#accordionExample1] > div.accordion-body {Parsedown(answer)}`.
- **페이지네이션/더보기 없음** — page 1(또는 page 파라미터)만 렌더. (notice와 달리 더보기 버튼 없음.)
- order: **idx desc** (PC는 faq_type asc — 모바일은 idx desc, 백엔드 처리).
- 아코디언 = Bootstrap collapse **data 속성**(layout `bootstrap.min.js`) → 클라이언트 컴포넌트 불필요.
- faq_type_label 16종: M01 계정,회원 / M02 포인트 / O01 주문,결제 / O02 제품 코드(키) / O03 취소,환불 / O04 가격 / O05 할인 / G01 상품 / G02 구성,DLC / G03 특전 / G04 한글 / S01 이용방법 / S02 게임 등록 / S03 게임 설치 / S04 게임 실행 / E01 기타.

### 세션/인터랙션
- 없음(비로그인). 검색 GET 폼 + Bootstrap 아코디언(data 속성)만.

## 모바일 head / 앱셸
- viewport: device-width, scale 1 고정, viewport-fit=cover, theme #000. apple-web-app.
- metadata: title="자주묻는 질문"(PC "자주묻는질문"과 공백 차이), description/keywords 빈값.
- 페이지 style: `#appCapsuleSub{padding-top:56px;}`.
- 자산: 신규 없음(accordion/searchbox 클래스 style.css 기존재).

## 데이터 (재사용/증분)
- **재사용**: `entities/board-faq` `getBoardFaqs(page, searchValue?)` + FaqRow(question_html/answer_html).
- **증분**: **없음**. 버튼 질문은 `stripTags(question_html)`(legacy는 raw question 인라인, Parsedown `<p>` 래퍼 제거해 인라인 표시) 프론트 처리. 답변은 `answer_html` 그대로(dangerouslySetInnerHTML).
- **미사용**: search_faq_type(UI 없음), totalPages(더보기/페이지네이션 없음), 검색 결과 갯수.

## API 계약 (증분)
- **없음**. `GET /api/board/faqs?page=N&searchValue=S` 재사용. mock(handler + boardFaqsFixture) 재사용.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/board/faq.html"` **추가**.
- **라우트**: `app/m/board/faq.html/page.tsx`(server) — searchParams(page/searchValue), 페이지 style, `getBoardFaqs(page, searchValue)` → `MobileFaqScreen`.
- **screen**: `screens/mobile-faq`(server) — `MobileSubHeader("자주묻는 질문")` + appCapsuleSub + extraHeader 검색폼 + 빈메시지/아코디언. faq_type_label 상수.
- **재사용 entities**: board-faq.
- **mock**: 기존 재사용(변경 없음).

## Parity 체크리스트 (모바일 UA)
- [ ] 검색폼(placeholder "검색어를 입력해 주세요.", searchValue value 유지, GET)
- [ ] 아코디언: `[구분라벨] 질문` 버튼 + collapse 답변(Parsedown) · data-bs-target #accordion{idx} · Bootstrap 토글
- [ ] 빈 목록: "검색된 게시물이 없습니다." 렌더
- [ ] 페이지네이션/더보기 없음(page 1만)
- [ ] head: title "자주묻는 질문"/theme #000/appCapsuleSub padding-top 56px
- [ ] middleware `/board/faq.html` rewrite(모바일 UA→/m) / 데스크톱 PC 유지

## 보류/후속
- search_faq_type 필터 — 모바일 원본에 UI 없음(범위 밖).
- 페이지 2+ 탐색 — 모바일 원본에 UI 없음(더보기/페이지네이션 부재, 그대로).
