# 모바일 이벤트 목록

## 원본 (legacy mobile)
- 파일: `mobile/event/event.html`
- PC 대응 단위: `docs/migration/storefront/event/event-list.md`
- 라이브 버전 판별: `mobile/event/event.html`이 단독 엔트리이며 `mobile/inc/sidebar.html` 이벤트 링크에서 도달하는 표준 이벤트 목록 URL이다.

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터: `/event/event.html`, GET 파라미터 없음
- 화면 요소:
  - `inc/sub_header.html` 앱 헤더, `$page_title="이벤트"`
  - `#appCapsuleSub.full-height`
  - `.section.mt-2.pt-2`
  - 이벤트 카드 반복:
    - `.card.mb-3`
    - `<a href={event_link_url} target={event_link_target}>`
    - `<img class="card-img-top rounded-0" alt={subject}>`
    - `.card-body.p-2`
    - `h5.card-title.font-16` 텍스트 `■ {subject}`
    - `.event_contents` = Parsedown HTML
  - 빈 목록 메시지는 주석 처리되어 실제 렌더 없음
- 폼 필드/검증: 없음
- 분기/리다이렉트: 없음
- 세션/권한 의존: 없음(public)

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`
- apple meta: `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`는 모바일 공통 레이아웃 선례와 동일하게 루트/레이아웃에서 처리
- theme-color: `#000000`
- metadata: title `이벤트`, description/keywords 빈값
- 사용 앱셸: `MobileSubHeader(pageTitle="이벤트")`; bottom-nav/sidebar/dialogs는 `app/m/layout.tsx` 공통
- 페이지별 CSS:
  - `.event_contents ul{padding-left:1rem;margin-bottom:0}`
  - `.event_contents li{font-size:12px}`
  - `.event_contents strong{font-size:12px;margin-top:10px}`
  - `.event_contents p{font-size:12px;margin-bottom:0}`

## 데이터
- 재사용 엔티티: `entities/event` `getEvents()`
- 재사용 계약: `GET /api/events`
- 모바일 전용 동작(증분/AJAX): 없음. `mobile/event/event.html`은 서버 렌더 반복만 있고 AJAX/POST가 없다.

## API 계약 (증분만, 백엔드 전달)
- 증분 없음. PC 이벤트 목록 계약을 그대로 재사용한다.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `/event/event.html`
- 라우트: `app/m/event/event.html/page.tsx`
- screen: `screens/mobile-event-list`
- 재사용 entities: `entities/event`
- 신규 UI: 없음(모바일 screen만 추가)
- mock: 기존 `GET */api/events` handler/fixture 재사용

## Parity 체크리스트 (모바일 UA)
- [x] 화면 요소 일치
- [x] 필드/검증 없음 일치
- [x] 분기/플로우 없음 일치
- [x] 모바일 head/viewport 일치
- [x] 증분/AJAX 없음 일치
- [x] 빈 목록 메시지 미렌더 일치
- [x] middleware rewrite/데스크톱 폴백 경로 등록
