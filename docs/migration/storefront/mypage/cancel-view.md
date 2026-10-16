# 취소완료 상세보기 (mypage/cancel-view)

## 원본
- 파일: `pc/mypage/mypage_cancel_view.html` (라이브 — 취소완료 내역 목록의 "상세보기" 대상)
- **DB**: 리뉴얼 DB(`$conn`, `$dsn`) — Mypage/Order/Goods 모두 `$conn`. `$conn_dgkr`는 열지만 **미사용**(dead).
- 도메인 클래스: `Mypage::getOrderV2`(tbl_order), `Mypage::getOrderItemV2`(tbl_order_item), `Order::getOrderAddress`(tbl_order_address), `Order::getDeliveryType`/`getOrderStatus`/`getPaymentMethod`/`getCheckoutStatus`(라벨)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, `PAYMENT-APPROVAL.md`
- 선례: `screens/mypage-cancel-end`(목록), `entities/mypage-order`, mypage 상세 카드 패턴

## 화면·플로우
- 진입 URL: `/mypage/mypage_cancel_view.html?settle_no=X`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(active `cancel_end`) + `section#content.content.rounded-0`. 인터랙션 없음(순수 SSR 상세).
- **주문상품 표**(5열, colgroup 10/*/8/8/8 — 구매확정 열은 legacy 주석처리):
  - 주문번호: `ordno`
  - 주문상품정보: `getDeliveryType(delivery_type)` 뱃지(`text-bg-secondary`) + `product_name`
  - 주문금액: `number_format(price)` 원
  - 진행상태: status==9 → `text-bg-danger` + `getOrderStatus`, else `text-bg-secondary` + `getOrderStatus`
  - 비고: status==9 → `취소 일자 : {cancel_date}` (else 빈값)
  - **숨김행 제외**: 각 item 뒤 `<tr class="d-none">`(키발송/배송 서브테이블 asset/ztorm/genba/vaultn/delivery)은 **토글 JS 없어 영구 숨김 → 이식 제외**(dead markup, 백엔드 서브쿼리 불필요).
- **배송지 정보 카드**(조건: address 존재 && `zipcode != ""`): 우편번호/주소(`address` + `address_detail`)/주문자(`name`)/휴대폰번호(`tel`) + 배송요청 메시지(`msg`, colspan 3). "배송지 수정" 버튼은 legacy `d-none`(modal 부재) → 숨김 유지.
- **주문 정보 카드**(col-6): 결제번호(`settle_no`) / 총 주문금액(`number_format(Σ item price)`) / 총 할인금액(`use_emoney+use_cash+member_dc` + "(포인트 할인 X 원: + 캐시할인 Y 원 + 회원 즉시할인 Z 원)") / 최종 결제금액(`order.total_price`)
- **결제 정보 카드**(col-6): 결제PG(`pg_provider` raw) / 결제수단(`getPaymentMethod(payment_method)`) / 결제상태(`getCheckoutStatus(step)`) / 결제일자(`payment_date`)
- 세션/권한: **로그인 필수** + settle_no는 m_no 소유 확인(getOrderV2 WHERE m_no)

### 라벨 맵 (view — 프론트 파생)
- getDeliveryType: 1=코드발송, 2=택배발송, 3=코드+택배발송
- getOrderStatus: 1주문대기/2주문완료/3배송준비/4배송중/5배송완료/6구매확정/8취소요청/9취소완료 (7·default 빈값)
- getPaymentMethod: SC0010=신용카드, SC0030=실시간 계좌이체, SC0040=가상계좌, SC0060=휴대폰, DG0000=전액할인, PAYCO=페이코, samsung=삼성페이, POINT=네이버포인트, toss_bank=퀵계좌이체, toss_pay=토스페이
- getCheckoutStatus: 1=입금대기, 2=결제완료, 8=환불요청, 9=환불완료, 99=취소완료

## SSR·SEO (legacy)
- head: `<title>취소완료 상세보기</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- inline `<style>.tr_0 td,.tr_0 th{background:#111}`는 `.tr_0` 미사용 → dead, 제외. page/*.css 없음. 전 구간 SSR.

## 데이터 (legacy)
- `Mypage::getOrderV2(m_no, settle_no)`: `SELECT * FROM tbl_order WHERE settle_no AND m_no` — settle_no, total_price, use_emoney, use_cash, member_dc, pg_provider, payment_method, step, payment_date
- `Mypage::getOrderItemV2(settle_no)`: `SELECT * FROM tbl_order_item WHERE settle_no` — ordno, product_name, price, delivery_type, status, cancel_date (order_system은 숨김행 전용 → 미사용)
- `Order::getOrderAddress(settle_no)`: `SELECT * FROM tbl_order_address WHERE settle_no` — zipcode, address, address_detail, name, tel, msg
- 총 주문금액 = Σ item.price(루프 합산). getGoodsItemDetail은 계산되나 표시 미사용(dead).

## 결제(PG) — 해당
- 취소완료 주문 상세 조회 전용(읽기). mutation 없음. 결제/할인/PG 정보 표시.

## API 계약 (백엔드 전달)
- `GET /api/mypage/orders/cancel-view?settle_no=X` (세션) → `{ order, items, address }`
  - `order: { settle_no, total_price:number, use_emoney:number, use_cash:number, member_dc:number, pg_provider, payment_method, step, payment_date }`
  - `items: CancelViewItem[]` — `{ ordno, product_name, price:number, delivery_type, status, cancel_date }`
  - `address: { zipcode, address, address_detail, name, tel, msg } | null` (없거나 zipcode 빈값이면 null)
  - 백엔드: getOrderV2(m_no=세션 소유확인), getOrderItemV2, getOrderAddress(리뉴얼 DB). 숨김행 서브쿼리 불필요.
- 응답 타입: `entities/mypage-order/model/cancel-view-types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_cancel_view.html/page.tsx` → `/mypage/mypage_cancel_view.html` (`requireMemberSession()`, `getMypageCancelView(settle_no)` deep import, searchParams)
- screen: `screens/mypage-cancel-view/ui/mypage-cancel-view-screen.tsx` (server) — 상품표 + 배송지 카드(조건) + 주문/결제 카드 2단
- entities: `entities/mypage-order` 확장 (`getMypageCancelView` server + `cancel-view-types.ts`)
- mock: `shared/mocks/fixtures/mypage-cancel-view.ts` + handler `GET */api/mypage/orders/cancel-view`

## Parity 체크리스트
- [ ] aside(취소완료 active) + 상품표 5열(delivery 뱃지/진행상태/취소일자) + 숨김행 제외
- [ ] 배송지 카드 조건부(zipcode) + 주문정보 카드(할인 분해) + 결제정보 카드(PG/수단/상태/일자)
- [ ] 라벨 맵 4종(getDeliveryType/getOrderStatus/getPaymentMethod/getCheckoutStatus) 정확
- [ ] 총 주문금액=Σprice / 최종결제=order.total_price / 할인=emoney+cash+member_dc
- [ ] SEO(title 취소완료 상세보기/description 빈/author H2interactive/viewport)
