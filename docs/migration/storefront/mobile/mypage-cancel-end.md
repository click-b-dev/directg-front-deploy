# 모바일 마이페이지 - 취소완료 내역 (mypage_cancel_end)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_cancel_end.html` (login_check)
- PC 대응: `screens/mypage-cancel-end`(`entities/mypage-order` `getMypageCancelEnd`). **entity 재사용**(증분 없음)
- 데이터: `Mypage2::getOrderList_v2(page, status='9' AND m_no, order_item_id DESC)`

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_cancel_end.html`(GET), title "취소 완료 내역"(공백 유지). **세션 필수**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("취소 완료 내역")`
- 본문 `#appCapsuleSub`: **검색폼/더보기/페이지네이션/빈메시지 없음**. 카드 반복만
  - card-header: order_date substr 0~10 + 상세보기(`mypage_order_view.html?settle_no=` — **PC는 cancel_view, 모바일은 order_view**)
  - card-body py-2: `.mb-1 > span.badge.bg-danger`(**하드코딩 "취소완료"** — getOrderStatus 미사용) + product_name(`.card-text`) + `.num` price+" 원"
  - bottom_menu + sidebar (`/m/layout` 전역)
- **인터랙션 전혀 없음**(요청철회 버튼조차 없음, cancel_request와 다름) → 순수 server component
- 날짜/상품명 필터: legacy PHP 필터 파싱하나 WHERE 주석처리(dead) + form 부재 → 전달 경로 없음

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "취소 완료 내역", description/keywords 빈값
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). screen 전체 server

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMypageCancelEnd(page)`(server-only, `GET /api/mypage/orders/cancel-end`, {list, page, totalPages}, `CancelEndItem`) · `requireMemberSession`
- mock 기존 재사용(`shared/mocks/fixtures/mypage-cancel-end.ts`)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_cancel_end.html`
- 라우트: `app/m/mypage/mypage_cancel_end.html/page.tsx`(server, requireMemberSession + getMypageCancelEnd(1))
- screen: `screens/mobile-mypage-cancel-end`(server) — MobileSubHeader + 카드(날짜/상세보기/취소완료 배지/상품명/₩)
- 재사용: `entities/mypage-order`·`member-auth`·`widgets/mobile-sub-header`
- 데스크톱 폴백: `app/(pc)/mypage/mypage_cancel_end.html`(PC ✅)

## 보존할 legacy quirk
- 배지 하드코딩 "취소완료"(bg-danger) — getOrderStatus 라벨맵 미사용(cancel_request와 다름)
- 상세보기 링크 `mypage_order_view.html`(PC의 cancel_view와 다른 타겟)
- 검색폼/더보기/페이지네이션/빈메시지 전부 없음(page 1만, `getOrderList_v2` 20건)
- delivery_type/배송상태 미표시(cancel_request와 달리 배송 관련 표기 전무)
- title "취소 완료 내역" 공백 포함(PC "취소완료 내역"과 다름)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·MobileSubHeader("취소 완료 내역")
- [x] 취소완료 카드(날짜/상세보기 order_view/하드코딩 취소완료 danger 배지/상품명/₩)
- [x] 인터랙션 없음(순수 server)·검색폼/더보기/페이지네이션/빈메시지 없음
- [x] 하단 네비 표시·title/viewport/theme#000
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_cancel_end)
