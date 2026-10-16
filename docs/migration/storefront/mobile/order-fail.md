# 모바일 주문실패 order_fail

## 원본 (legacy mobile)

- 파일: `mobile/order/order_fail.html` (99줄). `login_check.php`(로그인 가드) + 정적 카드.
- 로직: GET `msg`/`message` → 카드 본문에 연결 표시. "주문에 실패하였습니다" 헤드 + 장바구니 링크(`/order/cart.html`).
- 데이터/PG 없음(순수 표시). PC 대응: 해당 없음(order_fail은 실패 랜딩).

## 화면·플로우

- 진입: `/order/order_fail.html?msg=&message=` (결제 실패 시 리다이렉트 목적지).
- 가드: `login_check.php` → `requireMemberSession()`.
- 앱셸: `MobileSubHeader("주문실패")` + `#appCapsuleSub.full-height` + `.section.full.px-3.pt-2` > card(header h4 + body: msg+message + 장바구니 버튼).
- head: theme#000, title "주문실패", description/keywords 빈값. **popover style은 body에 popover 없어 dead → 미이식**.

## 데이터 / 재사용

- 엔티티/계약/mock: **없음**(정적 + 쿼리 표시). 재사용: `requireMemberSession`, `MobileSubHeader`.

## 타겟 매핑

- middleware MOBILE_ROUTES: `/order/order_fail.html`
- 라우트: `app/m/order/order_fail.html/page.tsx`(server, requireMemberSession + msg/message searchParams)
- screen: `screens/mobile-order-fail` `MobileOrderFailScreen(msg, message)`
- 신규 UI/mock: 없음.

## Parity 체크리스트 (모바일 UA)

- [ ] 로그인 가드
- [ ] msg+message 표시 / 장바구니 링크
- [ ] 헤더 "주문실패" / head theme#000
- [ ] middleware rewrite
- caveat: legacy `bottom_menu.html`(홈 variant) vs `/m/layout` 기본 bottom nav — 레이아웃 소유(경미)
