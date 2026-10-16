# 주문완료 (order_end.html)

order 영역 단위(04 주문완료). settle.html 결제 완료 후 redirect되는 결과 표시 화면(폼/뮤테이션 없음). 로그인 세션 전제(쿠키 포워딩).

## 원본
- 파일: `pc/order/order_end.html`(370줄, 라이브 — `yjs_order_end.html` 제외)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, `PAYMENT-APPROVAL.md`

## 화면·플로우
- 진입 URL: `/order/order_end.html?settle_no=&wait=`. 실제 진입은 settle.html 결제완료 redirect(다음 하드 게이트). 로그인 필수(login_check).
- `wait>0`이면 `sleep(1)`(DB 전파 대기 — **백엔드/no-op 처리**, 프론트 미재현).
- 데이터: `Order::getOrder(settle_no)`(order_info), `Order::getOrderItem(settle_no)`(항목), pg=kcp면 `Order::getKcpLog(settle_no)`(가상계좌 payment_log). 항목마다 `Goods::getGoodsItemDetail(product_code)`로 game_type/display_type/product_platform/goods_sku enrich.
- 화면 요소:
  - step nav 4단(04 주문완료 active bg-primary)
  - 헤드라인 `h4 bg-primary`: payment_method=SC0040 → "가상계좌(무통장입금) 결제 주문건은 기간 내에 입금 확인 후 주문이 완료됩니다." / else "주문이 완료되었습니다."
  - **가상계좌 입금 안내**(SC0040만): payment_log 표 — 결제금액/입금자(va_name)/입금계좌정보(bank_name+account)/예금주(depositor)/입금마감일시(va_date `YYYY-MM-DD HH:MM` 파싱)
  - 주문정보 표: caption "상품수 ( 총 N 개 )", 행마다 주문번호(ordno) + 상품카드(이미지/타입badge/플랫폼svg/배송badge/상품명) + 가격정보(할인율 `round((goods_price-price)*100/goods_price)` % bg-primary + goods_price(s) + price)
  - 결제정보 표: 결제번호(settle_no)·결제수단(payment_method_label)·결제상태(getCheckoutStatus(step))·결제/주문일자(SC0040은 "주문", else "결제")·총 주문 금액(sum price)·포인트 할인(use_emoney>0 시)·총 결제금액(total_price)
  - 버튼: 쇼핑 계속하기(`/index.php`), 주문내역 확인하기(`/mypage/mypage_order_view.html?settle_no=`)
  - gtag `purchase`(transaction_id=settle_no, value=total_price, items)
- **타입 badge 색(order_end 고유)**: game/basic→bg-info·edition→bg-primary·multi→bg-warning / dlc·music→bg-content / holomodels(본체 success·dlc content·edition primary). **bundle 케이스 없음**(switch 누락 = 번들은 badge 미표시, legacy 버그 verbatim). 모두 `rounded-0 font-12 py-2`.
- 플랫폼 아이콘: 1 steam.svg / 34 epic_w.svg / 35 rockstar_2.svg / 51 holomodels.svg(w-75) — cart식 svg.
- payment_method_label(프론트 static): SC0010 신용카드·SC0030 계좌이체·SC0040 가상계좌·SC0060 휴대폰·PAYCO 페이코·toss_bank 퀵계좌이체(토스)·POINT 네이버포인트·DG0000 전액할인·toss_pay 토스페이머니.

### 폼 필드/검증
- 없음(표시 전용). 인터랙션은 gtag purchase(1회)뿐.

### 분기/리다이렉트
- 비로그인 → login.html. SC0040 여부로 헤드라인/입금안내/일자라벨 분기.

### 세션/권한 의존
- `$_SESSION['member']` 로그인. `requireMemberSession()` 가드. 주문 조회는 settle_no 기준(세션 회원 소유 검증은 백엔드).

## SSR·SEO
- head: `<title>주문완료</title>`, description/author 빈값, viewport width=device-width,initial-scale=1. canonical/OG/구조화데이터 없음. 로그인 게이트.
- 페이지 전용 CSS 없음. SSR 표시, gtag purchase만 CSR.

## 데이터 (legacy)
- `getOrder(settle_no)`: settle_no, pg_provider, payment_method, step, payment_date, use_emoney, total_price.
- `getOrderItem(settle_no)`: ordno, product_code, product_name, delivery_type, goods_price(원가), price(판매가). + getGoodsItemDetail enrich(game_type/display_type/product_platform/goods_sku).
- `getKcpLog(settle_no)`(kcp만): amount, va_name, bank_name, account, depositor, va_date(YYYYMMDDHHMM…).
- `getCheckoutStatus(step)`: 결제상태 라벨(백엔드 resolve).

## 결제(PG)
- order_end는 **결제 결과 표시**(kcp 가상계좌 로그·결제수단/상태). PG 통합 아님. settle.html→order_end redirect가 진입(다음 단위).

## API 계약 (백엔드 전달)

### `GET /api/order/complete?settle_no=` — 주문완료 데이터 (쿠키 세션)
- 응답: `{ "order_info": OrderInfo, "items": OrderCompleteItem[], "payment_log": PaymentLog | null }`
- `OrderInfo`: settle_no, pg_provider, payment_method, step, checkout_status(getCheckoutStatus 라벨), payment_date, use_emoney(number), total_price(number)
- `OrderCompleteItem`: ordno, product_code, product_name, delivery_type, goods_price(number), price(number), game_type, display_type, product_platform, goods_sku
- `PaymentLog`(SC0040/kcp): amount, va_name, bank_name, account, depositor, va_date. 그 외 null.
- 백엔드: getOrder+getOrderItem+getGoodsItemDetail enrich, kcp면 getKcpLog. 세션 회원 소유 검증. `wait` 지연은 백엔드.

### 타입 → `entities/order/model/types.ts`(OrderInfo/OrderCompleteItem/PaymentLog/OrderComplete)

## 타겟 매핑
- 라우트: `app/(pc)/order/order_end.html/page.tsx`(server, `requireMemberSession` + searchParams settle_no + `getOrderComplete` 쿠키포워딩 + metadata "주문완료")
- screen: `screens/order-end` — `order-end-screen.tsx`(server 표시: step nav 04·헤드라인·[SC0040 입금안내]·주문정보표·결제정보표·버튼·footer_banner) + `purchase-gtag.tsx`(client, gtag purchase 1회)
- entities: `entities/order` `getOrderComplete` 추가(쿠키포워딩)
- widgets: `FooterBannerSection` 재사용
- mock: `shared/mocks/fixtures/order-complete.ts` + handler `GET /api/order/complete`

### 구현 노트(idiomatic)
- payment_method_label은 컴포넌트 const. checkout_status는 백엔드 라벨.
- 할인율 = goods_price>0 ? round((goods_price-price)*100/goods_price) : 0.
- va_date 파싱: substr 0/4/6/8/10 → `YYYY-MM-DD HH:MM`.
- 타입badge에 bundle 케이스 없음(legacy 그대로).
- `wait` sleep(1)·회원소유 검증은 백엔드 책임(프론트 미재현).

## Parity 체크리스트
- [ ] step nav 04 active
- [ ] 헤드라인 SC0040 분기
- [ ] SC0040 입금안내 표(payment_log·va_date 파싱)
- [ ] 주문정보표: 주문번호·타입badge(order_end색·bundle없음)·플랫폼svg·배송badge·상품명·할인율/원가/판매가
- [ ] 결제정보표: 결제번호/수단(label)/상태/일자(SC0040 라벨분기)/총주문금액/포인트할인(조건)/총결제금액
- [ ] 버튼 2개(index.php / mypage_order_view)
- [ ] gtag purchase(settle_no/total_price/items)
- [ ] SEO title "주문완료"·빈 desc·viewport
- [ ] number_format(콤마)

## 보류/후속
- **settle.html + PG**: 하드 게이트(order_end 실제 진입). 미구현 시 order_end 직접 접근(settle_no)만 가능.
- `mypage_order_view.html`(주문상세): 버튼 링크 대상 — mypage 영역(별도, 현재 미이관 화면). 링크만 유지.
- 주문 실패 `order_fail.html`: 별도 단위.
