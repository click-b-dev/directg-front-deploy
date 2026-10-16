# 주문 상세 — NaverPay 결제정보/취소 (217c-5)

order_view.php 네이버페이 결제 정보 카드(`pg_provider=="naverpay"`) + 결제취소. 217c PG별 분할 마지막.

## 원본
- 카드: order_view.php 1336~1452 (`if pg_provider=="naverpay"`), settle_log = naverpay_log(getOrderNaverPayLog2 등) + 외부 `naverPayPaymentsHistory`(후속).
- refund JS(2408~): `#btn_naverpay_refund` → confirm("해당 네이버페이 결제를 취소하시겠습니까?") → POST naverpayFrm(mode=naverpay_refund, settle_no, paymentId, cancelAmount=totalPayAmount) → reload. **모달 없음**.
- order_ps `naverpay_refund`(NaverPay cancel). **백엔드**.

## 화면 (네이버페이 카드, colgroup 25%/*, 금액 raw 표시)
- 결제번호(paymentId)/결제승인 유형(admissionTypeCode + 01 원결제 승인·03 전체취소·04 부분취소)/결제·취소 일시(admissionYmdt)/거래 완료 일시(tradeConfirmYmdt)
- 총 결제취소 금액(totalPayAmount)/구매자(applyPayAmount)/주 결제수단(primaryPayAmount)/포인트·머니(npointPayAmount)/즉시할인(discountPayAmount)
- 주 결제 수단(primaryPayMeans): **CARD**면 카드사(cardCorpCode)/카드번호(cardNo)/카드승인번호(cardAuthNo), **BANK**면 은행(bankCorpCode)/계좌번호(bankAccountNo)
- (step 2·8)결제완료일자(order_data.payment_date) + 결제취소[btn_naverpay_refund]

## API 계약
- 상세 `settle_log`(superset)에 naverpay 필드: payment_id/admission_type_code/admission_ymdt/trade_confirm_ymdt/total_pay_amount/apply_pay_amount/primary_pay_amount/npoint_pay_amount/discount_pay_amount/primary_pay_means/card_corp_code/card_auth_no/bank_corp_code/bank_account_no (+card_no 공용).
- `POST /admin/order/naverpay-refund` — `{settle_no, payment_id, cancel_amount}`. 성공 `{success}` → 상세 재조회.

## 타겟 매핑
- entities: settle_log naverpay 필드·`OrderNaverpayRefundRequest`·fetch/useNaverpayRefund.
- 스크린: `NaverpayPaymentCard`(모달 없음, confirm만).
- mock: settle_log naverpay 필드(빈값)·`POST naverpay-refund`.

## Parity 체크리스트
- [ ] pg=naverpay 카드·admissionTypeCode 라벨 3종·금액 raw·CARD/BANK 분기
- [ ] step 2·8 결제완료일자+결제취소→confirm→naverpay_refund(paymentId/cancelAmount)→재조회
- [ ] 외부 네이버페이 히스토리는 후속(제외)
