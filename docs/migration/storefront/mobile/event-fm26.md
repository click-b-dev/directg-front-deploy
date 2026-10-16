# 모바일 FM26 예약구매 이벤트

## 원본 (legacy mobile)
- 파일: `mobile/event/event_fm26.html`, 응모 처리 `mobile/event/event_fm26_ps.php`
- PC 대응 단위: `docs/migration/storefront/event/event-fm26.md`
- 라이브 버전 판별: 이벤트 목록의 `event_link_url`에서 직접 진입하는 개별 이벤트 하드코딩 페이지. `mobile/event/event_fm26.html`이 표준 엔트리이며 범용 이벤트 상세 라우트는 없다.

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터: `/event/event_fm26.html`, GET 파라미터 없음
- 화면 요소:
  - `inc/sub_header.html`, `$page_title="풋볼 매니저 26 예약구매 이벤트"`
  - `#appCapsuleSub.full-height`
  - `.section.mt-2.pt-2`
  - 상단 FM26 배너 링크: `/game/game_view.html?product_id=af3cca1a-d3ed-4b2d-ae85-79162db22328`
  - 붉은 안내문
  - 이벤트 안내 카드: 제목, #01/#02 내용, 기준, 기간, 당첨자 안내, 유의사항 8줄
  - 미로그인 배너: `이벤트 참여를 위해서는 로그인이 필요합니다.`
  - #01 포인트 3,000원 카드
  - #02 포인트 10,000원 카드
- 폼 필드/검증: 없음
- 분기/리다이렉트:
  - 미로그인: 로그인 필요 배너 표시, 두 이벤트 카드 버튼 영역 미출력
  - 로그인:
    - #01 `event_result1=="0"` → 미달성 뱃지
    - #01 `chk_event_member1=="Y"` → 수령완료 뱃지
    - 그 외 → `포인트 수령` 버튼 `data-no=38`
    - #02 → `구글폼 바로가기` 버튼 `data-no=39`
  - AJAX 응답:
    - `success` → alert 후 reload
    - `request` → `window.open(result_url,"_blank")`
    - 그 외 → alert 후 reload
- 세션/권한 의존:
  - 화면은 공개
  - 상태조회/응모는 로그인 세션 기반

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`
- theme-color: `#000000`
- title: `풋볼 매니저 26 예약구매 이벤트`
- description: legacy 긴 이벤트 설명 원문 유지
- canonical: `https://directg.net/event/event_fm26.html`
- 사용 앱셸: `MobileSubHeader(pageTitle="풋볼 매니저 26 예약구매 이벤트")`; bottom-nav/sidebar/dialogs는 `app/m/layout.tsx`
- 페이지별 CSS: `.section .card-header{background:#303D4E;}` (실제 본문에서 card-header는 없지만 원문 유지)

## 데이터
- 재사용 엔티티:
  - `entities/member-auth/api/get-member-session`
  - `entities/event/api/get-fm26-status`
  - `entities/event` `postFm26Apply`
- 모바일 전용 동작(증분/AJAX): 없음. `mobile/event/event_fm26_ps.php`는 PC `event_fm26_ps.php`와 동일 계약이다.

## API 계약 (증분만, 백엔드 전달)
- 증분 없음. PC FM26 이벤트 계약을 그대로 재사용한다.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `/event/event_fm26.html`
- 라우트: `app/m/event/event_fm26.html/page.tsx`
- screen: `screens/mobile-event-fm26`
- 재사용 entities: `member-auth`, `event`
- 신규 UI: `MobileEventApplyButton`(모바일 버튼 클래스만 legacy에 맞춤)
- mock: 기존 `GET */api/events/fm26/status`, `POST */api/events/fm26/apply` 재사용

## Parity 체크리스트 (모바일 UA)
- [x] 화면 요소 일치
- [x] 로그인/미로그인 분기 일치
- [x] #01 미달성/수령완료/포인트 수령 3분기 일치
- [x] #02 구글폼 버튼 분기 일치
- [x] AJAX 응답 분기(success/request/fail) 일치
- [x] 모바일 head/viewport/canonical 일치
- [x] 증분 API 없음 일치
- [x] middleware rewrite/데스크톱 폴백 경로 등록
