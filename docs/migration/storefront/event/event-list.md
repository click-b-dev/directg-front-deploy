# 이벤트 목록 (event/event-list)

## 원본
- 파일: `pc/event/event.html` (**라이브** — `pc/inc/header.html:106` GNB "이벤트" 메뉴 + `pc/service/sitemap.html:61`이 `/event/event.html` 링크. 표준 진입점)
- **DB**: 리뉴얼 DB(`$dsn`, `DB_USER`/`DB_PASSWORD`) + `Board` 클래스 `getEvenBoardtList()`(오타 "EvenBoardt" — 도메인 메서드명. 타겟 계약명은 정규화)
- 마크다운: `Parsedown`으로 `contents` 렌더 — `$parsedown->text(htmlspecialchars_decode($value['contents'], ENT_NOQUOTES))`. board-notice_view와 동일 방식(백엔드 렌더 HTML 계약).
- 세션/권한: **없음(공개 페이지)**. login_check 없음.
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/BOARD-CONTENT.md`, `PROMOTION-EVENT-OPS.md`
- 선례: `screens/board-notice-list`(공개 목록 SSR), `screens/board-notice-view`(contents_html Parsedown 계약)

## 화면·플로우
- 진입 URL: `/event/event.html` (GET 파라미터 없음). 페이지네이션 없음.
- 레이아웃: `div.wrap`(layout) > header > **breadcrumb 블록**(`container mt-3` > nav.breadcrumb: 다이렉트 게임즈(링크 `/`) > 이벤트(active)) > `container my-3 pb-5` > `main` > `section#content.content.rounded-0` > 이벤트 카드 반복.
- 이벤트 카드(`card mb-4 rounded-0` > `row g-0`):
  - `col-md-5`: `<a href={event_link_url} target={event_link_target}>` > `<img src={event_banner} class="img-fluid rounded-0 h-100" alt={subject}>`
  - `col-md-7`: `card-body` > `h4.card-title.mb-3` "■ {subject}" + `div.event_contents` = **contents_html(Parsedown 렌더)**
- **빈 목록: 빈 메시지 없음**(foreach만).
- 인터랙션: 없음(하단 jQuery/bootstrap bundle 로드하나 스피너 스크립트는 주석처리 = dead). 순수 SSR.

## SSR·SEO (legacy)
- head: `<title>이벤트</title>`, `description=""`, `author=H2interactive`. favicon. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- CSS: Bootstrap 5.3.5 + FA 6.7.2 + Noto Sans KR(layout 전역) + `custom.css`·`directg.css`·`styleguide.css`(layout 전역 이미 로드). **page-specific inline**: `.event_contents li{margin-bottom:5px}`(Parsedown `<ul><li>` 간격) — screen 내 `<style>`로 재현.
- 전 구간 SSR.

## 데이터 (legacy)
- **리뉴얼 DB** `Board::getEvenBoardtList()`:
  ```sql
  SELECT subject, contents, start_date, end_date, event_banner, event_link_url, event_link_target
  FROM tbl_event
  WHERE is_view='Y' AND start_date < {now} AND end_date > {now}
  ORDER BY end_date ASC, start_date ASC, -(idx) ASC
  ```
  - 조건: 노출(`is_view='Y'`) + **현재 진행중**(`start_date < now < end_date`, now=unix timestamp)
  - 정렬: 마감임박순(end_date asc) → 시작순(start_date asc) → 최신순(idx desc)
  - 카드 표시 필드: subject, contents(→contents_html), event_banner, event_link_url, event_link_target
  - **start_date/end_date는 카드에 미표시**(조건·정렬 전용 → 응답 타입 미포함)
- AJAX/POST 없음.

## API 계약 (백엔드 전달)
- `GET /api/events` (public, 세션 불필요) → `{ list: EventItem[] }`
  - `EventItem { subject:string; contents_html:string; event_banner:string; event_link_url:string; event_link_target:string }`
  - `contents_html`: legacy `Parsedown->text(htmlspecialchars_decode(contents, ENT_NOQUOTES))` 렌더 결과 HTML(본문). board-notice_view와 동일 계약.
  - 백엔드 책임: `tbl_event` 조회, `is_view='Y'` + 현재 진행중(`start_date < now < end_date`, unix ts) 필터, 정렬(end_date asc, start_date asc, idx desc). **페이지네이션 없음(전체)**. contents Parsedown 렌더.
- 응답 타입: `entities/event/model/types.ts`

## 타겟 매핑
- 라우트: `app/event/event.html/page.tsx` → `/event/event.html` (public, `getEvents()`, metadata title="이벤트")
- screen: `screens/event-list/ui/event-list-screen.tsx` (server) — breadcrumb + 이벤트 카드 반복 + `.event_contents li` inline style. contents는 `dangerouslySetInnerHTML`(board-notice-view 선례).
- entities: `entities/event` 신규 slice (`getEvents` fetcher + `types.ts`)
- 공용: 별도 없음(breadcrumb은 screen 인라인 — 공통 breadcrumb 위젯은 게임 도메인으로 연기 중)
- mock: `shared/mocks/fixtures/events.ts` + handler `GET */api/events`
- ⚠️ 이름 주의: `widgets/event-banner-section`(메인 2-3 단위)과 별개. 신규 slice명은 `event`/`event-list`로 구분.

## Parity 체크리스트
- [ ] breadcrumb(다이렉트 게임즈 > 이벤트) + section#content
- [ ] 이벤트 카드(row g-0, col-md-5 배너 링크 target + col-md-7 h4 "■ subject" + event_contents)
- [ ] contents_html(Parsedown 렌더) dangerouslySetInnerHTML + `.event_contents li` 간격 CSS
- [ ] 빈 목록(메시지 없음) / 페이지네이션 없음 / 진행중 필터·정렬(백엔드)
- [ ] SEO(title 이벤트/description 빈/author H2interactive/viewport)
