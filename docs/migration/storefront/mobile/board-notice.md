# 모바일 공지사항 (notice 목록 + 상세)

> legacy `mobile/board/notice.html`(목록) + `notice_view.html`(상세) → `/m/board/*`.
> PC 대응(`docs/migration/storefront/board/notice-list.md`·`notice-view.md`, `entities/board-notice`) **재사용**(증분 없음).
> 목록+상세를 한 단위로 이관(공지사항 기능, 동일 엔티티).

## 원본 (legacy mobile)
- 목록: `mobile/board/notice.html` (157줄) — `Board::getNoticeList($page, "", "is_notice desc,deploy_date desc")`, 20건/page.
- 상세: `mobile/board/notice_view.html` (120줄) — `Board::getNoticeView($idx)`, Parsedown(contents).
- 더보기 AJAX: `mobile/board/notice_ajax.php` (page N rows append).
- PC 대응: `board-notice` 엔티티(`getBoardNotices(page, searchValue?)` `{list, page, totalPages}`, `getBoardNoticeView(idx)` `{subject, deploy_date, contents, contents_html, ...}`)

## 화면·플로우 (legacy mobile 기준)

### 목록 (`notice.html`)
- 진입: `/board/notice.html?page=N` (빈 값 → 1).
- 셸: `sub_header`(pageTitle="공지사항") + `appCapsuleSub`.
- `section full mt-2 > ul.listview.image-listview.text#notice_list`: 공지마다 `li > a[/board/notice_view.html?idx={idx}].item > div.in > div > {subject} <footer>{deploy_date substr(0,10)}</footer>`
  - **isApp 분기**: isApp=="Y"면 링크 `?isApp=Y&idx=` — `directgames` 앱 UA 분기는 **후속**(sub_header와 동일 정책), 기본 링크 사용.
- **더보기**: `wide-block pt-2 pb-2 border-0 dg_bg > button#btn_paging.btn.btn-secondary.btn-block[data-page=1, data-total={totalPages}]` "( {current}/{total} ) 더보기".
  - 클릭: data-page==data-total → `alert("마지막페이지입니다")`; 아니면 `notice_ajax.php`로 다음 page 로드 → `#notice_list`에 append, data-page/current_page +1. (game_thumb 파일럿 `더보기` 패턴과 동일 — 서버액션 `loadMoreNotices`.)
- order: is_notice desc, deploy_date desc (백엔드).

### 상세 (`notice_view.html`)
- 진입: `/board/notice_view.html?idx=N`.
- 셸: `sub_header`(pageTitle="공지사항") + `appCapsuleSub`.
- `blog-post > h1.title.pt-2 {subject}` + `post-header > span.font-12 {deploy_date}` + `span "다이렉트 게임즈"` + `post-body.mb-2 {contents_html}` (`str_replace("&#13;&#10;","<br/>", Parsedown(contents))` = 엔티티 `contents_html`).
  - deploy_date는 **전체 표시**(목록은 substr 0,10).
- `section full > wide-block > a[/board/notice.html].btn.btn-cprimary.btn-block "목록"`.
- 페이지 전용 `<style>`: `.post-body{font-size:14px}` 등(head 주입).
- hit++는 백엔드 부수효과(`getBoardNoticeView`).

### 세션/인터랙션
- 목록 더보기(서버액션 증분)만. 로그인/세션 의존 없음.

## 모바일 head / 앱셸
- viewport: device-width, scale 1 고정, viewport-fit=cover, **theme-color #000**. apple-web-app.
- metadata: title="공지사항", description/keywords 빈값, favicon/apple-touch-icon.
- 자산: 신규 없음(listview/blog-post 클래스는 style.css/dg_style.css 기존재).

## 데이터 (재사용/증분)
- **재사용**: `entities/board-notice` `getBoardNotices(page)`(목록, 20/page) + `getBoardNoticeView(idx)`(상세). NoticeListRow/NoticeView.
- **증분**: **없음**. 목록 더보기는 클라이언트 증분 동작(같은 `getBoardNotices` paged 재사용) — 계약 불변.
- **미사용**: 검색(searchValue) — 모바일 목록엔 검색 UI 없음. notice_type/hit — 목록/상세 미표시.

## API 계약 (증분)
- **없음**. `GET /api/board/notices?page=N`·`GET /api/board/notices/:idx` 재사용. mock(handlers + boardNoticesFixture + buildBoardNoticeViewFixture) 재사용.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/board/notice.html"` + `"/board/notice_view.html"` **추가**.
- **라우트**:
  - `app/m/board/notice.html/page.tsx`(server) — searchParams(page), `getBoardNotices(page)` SSR → `MobileNoticeListScreen`.
  - `app/m/board/notice_view.html/page.tsx`(server) — searchParams(idx), 페이지 style, `getBoardNoticeView(idx)` → `MobileNoticeViewScreen`.
- **screen**:
  - `screens/mobile-notice-list` — `MobileSubHeader("공지사항")` + appCapsuleSub + `MobileNoticeList`(client, 초기 page1 + 더보기 증분) + 서버액션 `api/load-more-notices.ts`.
  - `screens/mobile-notice-view` — `MobileSubHeader("공지사항")` + appCapsuleSub + blog-post(server) + 목록 버튼.
- **재사용 entities**: board-notice.
- **mock**: 기존 재사용(변경 없음).

## Parity 체크리스트 (모바일 UA)
- [ ] 목록: listview 행(subject + deploy_date substr 0,10) · notice_view 링크 · 더보기(current/total·마지막페이지 alert·append·+1)
- [ ] 상세: blog-post(title/deploy_date 전체/다이렉트 게임즈/contents_html) · 목록 버튼 · post-body style
- [ ] head: title "공지사항"/theme #000
- [ ] middleware `/board/notice.html`·`/board/notice_view.html` rewrite(모바일 UA→/m) / 데스크톱 PC 유지
- [ ] 엣지: 공지 0건(빈 목록) · 마지막 페이지 더보기 alert · contents 개행(<br/>) 렌더

## 보류/후속
- `directgames` 앱 UA 분기(목록 링크 isApp=Y) — sub_header 앱 분기와 함께 후속.
- 목록 검색(searchValue) — 모바일 원본에 UI 없음(범위 밖).
