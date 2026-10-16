# 모바일 입금대기 상세 mypage_order_wating_view (PG 인접, 구조 parity)

## 원본 (legacy mobile)

- 파일: `mobile/mypage/mypage_order_wating_view.html` (627줄). `login_check.php` 가드.
- 데이터: `getOrderV2(m_no, settle_no)` + `getOrderItemV2(settle_no)` + `getOrderAddress(settle_no)` + PG bill_url(kcp/payco/toss, step=2).
- **`mypage_order_view.html`(631줄, 이미 ✅ 이관)와 ~95% 동일.** 차이:
  - 결제정보 섹션에 **입금정보(입금자 depositor / 입금은행 bank_name / 계좌번호 account)** 표시 — 가상계좌(SC0040) 입금대기.
  - 나머지(상품카드 상태배지/키확인·활성화·취소요청/주문정보/결제정보/모달·배송조회)는 order_view와 동일.

## 데이터 / 재사용·증분

- **재사용**: `entities/mypage-order` `getMypageOrderView(settle_no)`(OrderViewOrder + items + address + bill_url) — order_view와 동일 계약. `MobileOrderViewItems`(client: activate/license/orderCancel 모달 + 배송조회 + 뮤테이션) 재사용.
- **증분**: `OrderViewOrder`에 입금정보 필드 추가 — `depositor?`, `bank_name?`, `account?`(SC0040 입금대기 시). 백엔드가 kcp/payco vbank 로그에서 조립. (list `waiting-types`에 이미 유사 필드 존재 — 계약 정합.)
- mock: 기존 order-view mock에 deposit 필드 추가(또는 waiting 전용 fixture).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/mypage/mypage_order_wating_view.html`
- 라우트: `app/m/mypage/mypage_order_wating_view.html/page.tsx`(server, requireMemberSession + settle_no + getMypageOrderView)
- screen: `screens/mobile-mypage-order-waiting-view` — `mobile-mypage-order-view` 구조 미러(MobileSubHeader("주문 내역 상세보기") + 상품카드(MobileOrderViewItems 재사용) + 주문정보 + 결제정보 **+ 입금정보 섹션**)
- 재사용: `mypage-order`(order-view), `MobileOrderViewItems`, `requireMemberSession`, `MobileSubHeader`.

## 하드 게이트 / 검증한계

- **PG 인접**(개발자 승인 필요, settle/order_view 선례와 동일). 실제 결제·PG 로그·bill_url은 백엔드/merchant 의존 → **구조 parity**로 이관(검증한계).
- 위시/장바구니/취소 뮤테이션은 order-view 재사용분(order 도메인).

## Parity 체크리스트 (모바일 UA)

- [ ] 로그인 가드 + settle_no 조회
- [ ] 상품카드 상태배지/버튼(order_view 재사용)
- [ ] 주문정보/결제정보 섹션
- [ ] **입금정보(입금자/입금은행/계좌번호)** — SC0040 입금대기
- [ ] bill_url(step=2 고객영수증)
- [ ] middleware rewrite
- caveat: PG 구조 parity(검증한계), order_view와 ~95% 동일(입금정보만 증분)
