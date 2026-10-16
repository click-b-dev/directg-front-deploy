# 주문 상세 — Tosspay 결제정보/취소 (217c-3)

order_view.php 토스페이 결제정보 카드(`pg_provider=="toss_pay"`) + 부분취소. 217c PG별 분할 3번째.

## 원본
- 카드: order_view.php 1071~1146 (`else if pg_provider=="toss_pay"`), settle_log = `tosspay_log`(getOrderTosspayLog) + 외부 `Tosspay::viewPayment`.
- 부분취소 모달: 2251~2304 `#order-tosspay-refund-modal`(tosspayFrm mode=tosspay_refund).
- refund JS(2394~2406): `#btn_tosspay_refund` → confirm("해당 토스페이 결제를 취소하시겠습니까?") → POST tosspayFrm → reload.
- order_ps `tosspay_refund`(부분취소). **백엔드**.

## 화면 (토스페이 카드, colgroup 35%/*)
- 결제수단(payMethod switch: TOSS_MONEY=토스머니/CARD=카드/TOSSPAY_MONEY=토스페이머니/ACCOUNT/RESELLER_CARD/BNPL, else 빈값)
- 총 결제금액(amount nf) / 할인 금액(discountedAmount nf 원) / 취소 가능금액(paidAmount nf) / 결제완료처리 시간(paidTs)
- (step 2)결제취소[버튼] → #order-tosspay-refund-modal
- 거래영수증(bill_url 미설정 → 빈 href)

### order-tosspay-refund-modal
- 결제번호(settle_no)/결제수단(getSettlekindLabel)/주문금액(amount nf 원)/결제금액(paidAmount nf 원)/취소금액 input(cancelAmount, "입력하지 않으면 전액")
- 숨김: mode=tosspay_refund, settle_no, payToken, refundNo=REFUND_{refund_num}_{settle_no}(백엔드 생성)
- "결제 취소" → confirm → tosspay_refund(settle_no/payToken/cancelAmount) → reload

## API 계약
- 상세 `settle_log`(superset)에 tosspay 필드: discounted_amount/paid_amount/paid_ts/pay_token (+공용 amount·pay_method(payMethod)).
- `POST /admin/order/tosspay-refund` — `{settle_no, pay_token, cancel_amount}`(빈값=전액). refundNo는 백엔드 생성. 성공 `{success}` → 상세 재조회.

## 타겟 매핑
- entities: settle_log tosspay 필드·`OrderTosspayRefundRequest`·fetch/useTosspayRefund.
- 스크린: `TosspayPaymentCard`·`TosspayRefundModal`.
- mock: settle_log tosspay 필드(빈값)·`POST tosspay-refund`.

## Parity 체크리스트
- [ ] pg=toss_pay 카드·payMethod 라벨 6종·금액 nf·할인/취소가능/결제완료시간
- [ ] step 2 결제취소→모달·부분취소(cancelAmount 빈값 전액)·거래영수증 빈 href
- [ ] refund confirm 문구·POST·성공 재조회
- [ ] 외부 토스페이 히스토리는 후속(제외)
