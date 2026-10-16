# 모바일 마이페이지 - 문의 내역 (mypage_qna)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_qna.html` (라이브 — `mypage_main.html:152`에서 링크, `kdy_mypage_qna.html` 변형 아님) + 더보기 `ajax_qna.php` + 조회로그 `mypage_qna_proc.php` mode=view
- PC 대응: `docs/migration/storefront/mypage/qna-list.md` (`screens/mypage-qna` + `entities/mypage-qna`). **entity 재사용, 증분 없음**
- 데이터: `Mypage::getQnaMobileList(page, user_id=세션 m_id, reg_date DESC, 10건/page)` + `Parsedown`

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_qna.html`(GET `?page=N`, 기본 1), title "문의 내역". **세션 필수(login_check)**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("문의 내역")`
- 본문 `#appCapsuleSub` > `section full` > `section-title mt-2` "문의 내역" + `accordion#accordion`
  - **검색 폼 없음**(`search_goods_name` filter_input만 존재, 폼 미존재) · **페이지네이션 없음**(더보기 방식)
  - accordion-item 반복(초기 렌더):
    - `button.btn-show-answer.accordion-button.collapsed.justify-content-between.pe-5`(style `justify-content:space-between !important`, data-bs-toggle=collapse, data-bs-target=`#accordion_{idx}`, **data-idx={idx}**) > `span.col-9.p-0`{subject} + 배지(is_answer=="Y" → `badge badge-primary col-3 ms-1` "답변완료" / else `badge badge-danger col-3 ms-1` "답변대기중")
    - `div#accordion_{idx}.accordion-collapse.collapse[data-bs-parent=#accordion]` > `accordion-body.py-0` > `card-body.mb-3.p-1`: h4 "문의내용" + `div.p-1.shadow-none.rounded-0`(contents_html) + hr + h4 "답변" + `div.p-1.shadow-none.rounded-0`(is_answer=="Y" ? answer_html : "답변 대기중 입니다.")
  - **더보기 버튼**(`col-12` > input[type=button]): page>=total_pages → `btn-secondary` value "마지막 페이지" / else `btn-primary` value "더보기", data-page={page}, `btn-lg btn-block`
- 나이/권한: 로그인 필수(목록·조회로그 모두)

## 인터랙션 (legacy JS)
- **더보기**(`#btn_more` click): `page = data-page + 1` → `$.get('./ajax_qna.php', {page, page_num:"10"})` → `.accordion.append(data)`; `if (page >= total_pages)`(total_pages=초기 렌더 상수) → data-page=page, val "마지막 페이지", btn-primary→btn-secondary; else data-page=page 유지. **마지막에서도 클릭 시 재요청(빈 응답 append=무효과), 가드 없음**
- **답변 조회로그**(DOMContentLoaded, `.btn-show-answer` 각각): 클릭 시 badge 텍스트가 "답변대기중" 포함이면 return(로그 없음). else `aria-expanded==='true'`(펼침)일 때만 `POST mypage_qna_proc.php {idx, mode:view}` fire-and-forget → `UPDATE tbl_qna SET replyStatus=1`
- 아코디언 토글: Bootstrap collapse(data 속성, `bootstrap.min.js`)

## ajax_qna.php(더보기 증분) — 초기 렌더와의 차이 (legacy quirk 2건)
1. 증분 항목 버튼에 **`btn-show-answer` 클래스·`data-idx` 없음** → 더보기로 추가된 항목은 **조회로그 미발생**(펼쳐도 replyStatus 갱신 안 함). 초기 렌더 항목만 로그.
2. 답변 렌더가 다름: 초기는 `htmlspecialchars_decode($value['answer'])`(**Parsedown 미적용**), ajax는 `htmlspecialchars_decode($parsedown->text($value['answer']))`(**Parsedown 적용**). → **백엔드 계약 결정 필요**(§API 계약).

## 모바일 head / 앱셸
- viewport device-width scale 1 고정 viewport-fit cover, theme #000, apple-web-app capable/black-translucent, title "문의 내역", description/keywords 빈값
- 앱셸: `MobileSubHeader("문의 내역")` + `/m/layout` bottom-nav/sidebar(표시) + `bootstrap.min.js`(아코디언 collapse). screen은 목록/더보기/조회로그 인터랙션 → **client**
- 페이지별 mobile-assets CSS: 없음(공통 style/dg_style/styleguide만)

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMypageQna(page)`(server-only, `GET /api/mypage/qna?page=N`, `{list: QnaRow[], page, totalPages}`) · `postMypageQnaView(idx)`(client, `POST /api/mypage/qna/view`, fire-and-forget) · `requireMemberSession`
- `QnaRow { idx, gubun, subject, reg_date, is_answer, contents_html, answer_html }` — contents_html/answer_html은 백엔드 렌더
- **백엔드 계약 결정(legacy quirk 2)**: 초기/증분 answer 렌더 불일치. 단일 계약(`answer_html`)로 통일 → **초기 페이지 동작 기준(Parsedown 미적용, decode만)** 채택. 게이트에서 개발자 확인.
- mock 기존 재사용(`GET */api/mypage/qna` page/totalPages 지원, fixture 3건: 답변완료 2 + 대기 1)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_qna.html`
- 라우트: `app/m/mypage/mypage_qna.html/page.tsx`(server, requireMemberSession + getMypageQna(1) deep import → initialList/totalPages)
- screen: `screens/mobile-mypage-qna`
  - `ui/mobile-mypage-qna-screen.tsx`(server) — MobileSubHeader + section-title + `<MobileQnaAccordion>`
  - `ui/mobile-qna-accordion.tsx`(**client**) — 아코디언 목록 + 더보기 + 초기 항목 조회로그
  - `api/load-more-qna.ts`(`"use server"`) — getMypageQna(nextPage) → QnaRow[]
- 재사용 entities: `entities/mypage-qna`(getMypageQna·postMypageQnaView) · `member-auth`
- 신규 UI: 위 client 아코디언. mock: 기존 재사용

## 보존할 legacy quirk
- section-title "문의 내역"이 헤더 title과 별개로 본문에도 표시
- 검색 폼 없음 / 페이지네이션 없음(더보기만)
- **더보기 증분 항목은 조회로그 미발생**(초기 렌더 항목만 로그) — quirk 1
- 더보기 마지막 페이지에서도 클릭 시 재요청(무효과), 가드 없음
- 조회로그는 답변완료 항목 펼침 시에만(대기중은 없음)
- answer 초기/증분 Parsedown 불일치 → 백엔드 단일계약(초기 기준)으로 통일(quirk 2, 게이트 확인)

## Parity 체크리스트 (모바일 UA)
- [ ] 세션 가드·MobileSubHeader("문의 내역")·section-title·검색폼/페이지네이션 없음
- [ ] 아코디언(subject + 답변완료/답변대기중 배지 + 문의내용/답변 collapse)
- [ ] 미답변 답변란 "답변 대기중 입니다."
- [ ] 더보기(page>=total_pages → 마지막 페이지 secondary / else 더보기 primary, 증분 append)
- [ ] 조회로그(초기 답변완료 항목 펼침 시 POST view, 대기중·증분항목 미발생)
- [ ] 모바일 head/viewport/theme #000/title · 하단 네비 표시
- [ ] middleware rewrite + 데스크톱 폴백(PC mypage_qna)
