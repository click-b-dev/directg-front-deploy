# 주문 상세 — Payco 결제정보/취소 (217c-4)

order_view.php PAYCO 결제 정보 카드(`pg_provider=="payco"`) + 복합결제 상세 + 결제취소/계좌반납. 217c PG별 분할 4번째(최다 복잡).

## 원본
- 카드: order_view.php 1152~1334 (`if pg_provider=="payco"`), settle_log = payco_log, `paymentDetails`(json_decode) 복합결제.
- refund JS(2338~2363): `#btn_payco_refund` → confirm("해당 PAYCO결제를 취소하시겠습니까?") → POST paycoFrm(mode=payco_refund, settle_no, orderNo, cancelTotalAmt=totalPaymentAmt, orderCertifyKey) → reload. `#btn_payco_cancel`(계좌반납) → mode=payco_cancel로 변경 후 동일.
- 결제 상세정보(#order_detail, step 2) → order_detail.php 팝업(PaycoPG). **후속(제외)**.
- order_ps `payco_refund`(PaycoPG::paycoCancel, step=9), `payco_cancel`(무통장 입금만료 계좌반납). **백엔드**.

## 화면 (PAYCO 결제 정보 카드, colgroup 25%/*)
- PAYCO 예약번호(reserveOrderNo) [+step2 결제 상세정보 버튼=후속 제외]
- PAYCO 주문번호(orderNo)/주문자명(memberName)/주문자 EMAIL(memberEmail)/총 주문금액(totalOrderAmt nf)
- **복합결제 합계**(paymentDetails paymentAmt 합 nf 원 + count 뱃지)
- paymentDetails[] 반복(▣ idx. paymentMethodName paymentAmt원):
  - 결제일시(tradeYmdt)/결제 승인번호(pgAdmissionNo)/결제 승인일시(pgAdmissionYmdt)/간편결제여부(easyPaymentYn)/총 결제금액(paymentAmt + 공급가액 taxableAmt + 부가세 vatAmt)
  - cardSettleInfo(카드사명/코드/번호/할부/승인번호/무이자/법인/부분취소가능/매입사코드)
  - cellphoneSettleInfo(통신사명/휴대폰번호)
  - realtimeAccountTrasferSettleInfo(은행명/코드)
  - nonBankbookSettleInfo(은행명/코드/계좌번호/입금만료일) + (step 1·8)계좌반납[btn_payco_cancel]
  - couponSettleInfo(할인금액/조건)
- ■ 결제 처리 / 영수증 · (step 2)결제취소[btn_payco_refund] · 거래영수증(bill.payco.com/seller/receipt/GBPT2K/{sellerOrderReferenceKey}/{orderNo})

## API 계약
- 상세 응답에 `payco`(OrderDetailPaycoInfo): reserve_order_no/order_no/member_name/member_email/total_order_amt/total_payment_amt/order_certify_key/seller_order_reference_key/payment_details[](settle-info 5종 nullable).
- `POST /admin/order/payco-refund` / `POST /admin/order/payco-cancel` — `{settle_no, order_no, cancel_total_amt, order_certify_key}`. 성공 `{success}` → 상세 재조회.

## 타겟 매핑
- entities: `OrderDetailPaycoInfo`·`OrderDetailPaycoPaymentDetail`·`OrderDetailResponse.payco`·`OrderPaycoRefundRequest`·fetch/usePaycoRefund·usePaycoCancel.
- 스크린: `PaycoPaymentCard`·`PaycoPaymentDetailRows`.
- mock: `payco: null`(pg=kcp)·`POST payco-refund`·`payco-cancel`.

## Parity 체크리스트
- [ ] pg=payco 카드·예약/주문/주문자/총주문·복합결제 합계+수단 count
- [ ] paymentDetails 반복·승인정보·settle-info 5종 조건 렌더·공급가액/부가세
- [ ] 계좌반납(무통장·step 1·8)→payco_cancel·결제취소(step 2)→payco_refund·confirm→POST→재조회
- [ ] 거래영수증 bill.payco URL
- [ ] 결제 상세정보 팝업(order_detail.php)·외부 히스토리는 후속(제외)
