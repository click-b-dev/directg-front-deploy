# 주문 상세 — Toss 결제정보/취소 (217c-2)

order_view.php 토스 결제정보 카드(`pg_provider=="toss"`) + 결제취소/부분취소. 217c PG별 분할 2번째. 외부 토스 히스토리(viewPayment)는 후속.

## 원본
- 카드: order_view.php 926~1067 (`if pg_provider=="toss"`), **2변형**:
  - `payment_method=="toss_bank"`(계좌이체): settle_log = `toss_adapter_log`(getOrderTossAdapterLog). mod_type=STSC.
  - else(일반): settle_log = `toss_log`(getOrderTossLog) + 외부 `Toss::viewPayment`.
- 부분취소 모달: order_view.php 2199~2249 `#order-refund-modal`(tossFrm mode=toss_refund).
- refund JS(2380~2392): `#btn_toss_refund` → mod_type from data-modetype → confirm("해당 토스 결제를 취소하시겠습니까?") → POST tossFrm → reload.
- order_ps: `toss_adapter_refund`(Tossadapter::cancelPayment), `toss_refund`(부분취소). res_cd=0000이면 step=9. **백엔드**.

## 화면
### toss_bank 카드(계좌이체)
- 은행명(bank_name)/은행코드(bank_code)/(coupon_mny>0)즉시할인 금액(nf 원)/계좌이체 결제 금액(bk_mny nf 원)/현금영수증 승인번호(cash_authno)/현금영수증 거래번호(cash_no)/계좌이체 결제시각(app_time)/tno/에스크로 여부(escw_yn)
- (step 2)결제취소[버튼 #btn_toss_refund data-modetype=STSC] → toss_adapter_refund(settle_no/mod_type STSC/tno) confirm→reload
- 거래영수증: 가맹점용 현금영수증 보기 → `https://dashboard.tosspayments.com/receipt/mids/directg/orders/{settle_no}/cash-receipt?ref=PX`

### 일반 toss 카드
- 결제수단(method)/총 결제금액(total_amount nf)/(coupon_mny>0)즉시할인 금액(ba nf 원)/취소 가능금액(balance_amount nf)/결제 시간(requested_at)/승인 시간(approved_at)
- (step 2)결제취소[버튼] → **#order-refund-modal** 오픈
- 거래영수증(bill_url 미설정 → 빈 href, 그대로 이식)

### order-refund-modal(일반 toss 부분취소)
- 결제번호(settle_no)/결제수단(getSettlekindLabel)/결제금액(total_amount nf 원)/취소가능금액(balance_amount nf 원)/취소금액 input(cancelAmount, "입력하지 않으면 전액")
- "결제 취소" 버튼 → confirm → toss_refund(settle_no/paymentKey/cancelAmount) → reload

## API 계약 (백엔드 전달)
- 상세 응답 `settle_log`(superset)에 toss 필드: method/total_amount/ba/balance_amount/requested_at/approved_at/payment_key (+공용 bank_name/bank_code/coupon_mny/bk_mny/cash_authno/cash_no/app_time/tno/escw_yn).
- `POST /admin/order/toss-adapter-refund` — `{settle_no, mod_type, tno}`. `Tossadapter::cancelPayment`.
- `POST /admin/order/toss-refund` — `{settle_no, payment_key, cancel_amount}`(빈값=전액). 부분취소.
- 성공 `{success}`. 프론트는 상세 재조회.

## 타겟 매핑
- entities: `OrderDetailSettleLog`(superset·toss 필드 추가)·`OrderTossAdapterRefundRequest`·`OrderTossRefundRequest`·fetch/useTossAdapterRefund·useTossRefund.
- 스크린: `TossPaymentCard`(2변형)·`TossRefundModal`(부분취소 제어).
- mock: settle_log toss 필드(pg=kcp mock이라 빈값)·`POST toss-adapter-refund`·`toss-refund`.

## Parity 체크리스트
- [ ] pg=toss·toss_bank/일반 2변형 필드·즉시할인 조건·금액 nf
- [ ] toss_bank 결제취소(step 2·data-modetype STSC)→adapter_refund·현금영수증 bill_url
- [ ] 일반 결제취소(step 2)→모달·부분취소(cancelAmount 빈값 전액)·거래영수증 빈 href
- [ ] refund confirm 문구·POST·성공 재조회
- [ ] 외부 토스 히스토리는 후속(제외)
