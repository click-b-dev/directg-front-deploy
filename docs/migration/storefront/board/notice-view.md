# 공지사항 상세 (board/notice_view)

## 원본
- 파일: `pc/board/notice_view.html` (공지목록 제목 링크 대상 `?idx=`)
- 도메인 클래스: `src/classes/Board.php::getNoticeView($idx)` + `html_print2` + `Parsedown`
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/BOARD-CONTENT.md`, `SEO-CHANNEL.md`
- 선례: `entities/board-notice`(목록), agreement/private(dangerouslySetInnerHTML), home(canonical/alternate metadata)

## 화면·플로우
- 진입 URL/파라미터: `/board/notice_view.html?idx=N` (idx: FILTER_SANITIZE_NUMBER_INT)
- 화면 요소 (legacy 기준):
  - `div.wrapper` > `container my-3 pb-5` > main > `div.row` > `div.col-12`
    - `article.blog-post`:
      - `h2.h2.mb-3` — subject
      - `p.blog-post-meta.font-12` — `{deploy_date} by <span>다이렉트 게임즈</span>`
      - `hr/`
      - `div.blog-contents.font-14` — 본문 HTML (아래 파이프라인)
    - `hr.mb-3/`
    - `nav.blog-pagination`: (이전글/다음글 주석) + `a[href="notice.html"].btn.btn-lg.btn-outline-light.rounded-0[aria-disabled=true]` "목록"
    - (col-md-3 추천상품 사이드바 — 주석처리, 미렌더)
- 본문 파이프라인 (legacy): `contents`(DB) → `html_print2`(엔티티 디코딩) → `Parsedown->text`(마크다운) → `str_replace("&#13;&#10;","<br/>")` → `.blog-contents` HTML 출력
- 부수효과: `update tbl_notice set hit=hit+1 where idx` (조회수 증가) — **백엔드 책임**
- 폼/검증: 없음. 세션/권한 의존: **없음**(비로그인 접근)

## SSR·SEO (legacy) — 이 도메인 첫 canonical/alternate 페이지
- title `공지사항`, viewport `width=device-width, initial-scale=1.0`, author `H2interactive`
- **`<meta name="description" content="{contents}">`** — html_print2 디코딩된 contents 전문(Parsedown 미적용 버전)
- **canonical** `https://directg.net/board/notice_view.html?idx={idx}`
- **alternate** 모바일 `https://m.directg.net/board/notice_view.html?idx={idx}` `media="only screen and (max-width: 640px)"` `hreflang="ko-kr"`
- 페이지 CSS `<style>`: `.blog-contents img{max-width:90%;padding-bottom:20px}` `.blog-contents hr{padding-bottom:20px}` `.blog-contents iframe{padding-top/bottom:20px}` `strong{}`(빈 규칙) → `page/notice-view-inline.css`
- legacy 오타 `</iframeead>`(정상 `</head>`) — head 영역 중앙화라 미재현(무영향)
- SSR: 전 구간 SSR. idx별 동적 metadata → `generateMetadata`

## 데이터 (legacy)
- `getNoticeView($idx)`: `select idx,subject,deploy_date,notice_type,hit,contents from tbl_notice where idx=:idx` → contents는 `html_print2` 적용
- `html_print2`: `&#60;`→`<`, `&#62;`→`>`, `&#34;`→`"`, `&#38;`→`&`, `&amp;`→`&`, `"` 제거, `&lt;`→`<`, `&gt;`→`>`

## API 계약 (백엔드 전달)
- `GET /api/board/notices/:idx` → `{ idx, subject, deploy_date, notice_type, hit, contents, contents_html }`
  - `contents`: html_print2 디코딩 원문(meta description용)
  - `contents_html`: `Parsedown(contents)` + `&#13;&#10;`→`<br/>` 최종 HTML(본문용)
  - 백엔드 책임: 위 파이프라인 + 조회 시 `hit=hit+1` 증가
- 응답 타입: `entities/board-notice/model/types.ts` (`NoticeView`)
- 프론트는 요청당 1회 조회(React `cache()`로 generateMetadata·page 공유 → hit 중복증가 방지)

## 타겟 매핑
- 라우트: `app/board/notice_view.html/page.tsx` → `/board/notice_view.html` (searchParam idx) + `generateMetadata`
- screen: `screens/board-notice-view` (본문 `dangerouslySetInnerHTML`=contents_html)
- entities: `entities/board-notice` (`getBoardNoticeView(idx)`, cache 래핑)
- 자산: `public/assets/css/page/notice-view-inline.css`
- mock: `shared/mocks/fixtures/board-notice-view.ts` + handler `GET */api/board/notices/:idx`

## 단위 경계 결정 / quirk
1. 본문 마크다운·엔티티 디코딩·br 치환은 **백엔드 책임**(contents_html). 프론트는 raw HTML 렌더.
2. meta description=contents 원문(Parsedown 미적용) — 별도 필드 `contents`.
3. canonical/alternate는 `generateMetadata`. alternate `hreflang="ko-kr"`는 Next `alternates.media`가 미방출 → 경미한 속성 차이(보고서 명시).
4. hit++ 백엔드, mock은 미증가. cache()로 요청당 1회 조회.
5. 목록 링크 상대 href `notice.html` 유지. 주석 사이드바/이전·다음글 미렌더.
6. `</iframeead>` 오타·head는 중앙 layout이라 무관.

## Parity 체크리스트
- [ ] article(제목 h2 + meta "by 다이렉트 게임즈" + hr + 본문 + hr + 목록 버튼)
- [ ] 본문 contents_html 렌더(마크다운·br·img/hr/iframe 스타일)
- [ ] SEO: description=contents / canonical(idx) / alternate 모바일(idx)
- [ ] title 공지사항 / viewport / author H2interactive
- [ ] 목록 버튼 → notice.html
