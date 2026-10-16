# 주문 상세 — Payco 결제 상세정보 팝업 (217i)

order_view.php Payco 카드 `#order_detail` 버튼(step2) + `order_detail.php`(paycoGetDetailForVerify 검증 덤프 팝업).

## 원본
- 버튼: order_view.php 1176 (PAYCO 예약번호 row, `step=="2"`) `#order_detail` data-reserveorderno(reserveOrderNo)/data-sellerorderreferencekey(settle_no).
- JS(2585~2607): POST `order_detail.php` {reserveOrderNo, sellerOrderReferenceKey} → 응답 HTML을 `window.open` 팝업에 write.
- `order_detail.php`: `PaycoPG::paycoGetDetailForVerify(params)` → `debug(json_decode(result))`(검증용 raw 덤프).

## API 계약
- `POST /admin/order/payco-detail` — `{reserve_order_no, seller_order_reference_key}`. 백엔드: PaycoPG 검증 조회. 응답 `{detail}`(Payco 응답 원본). 팝업에 JSON 표시.

## 타겟 매핑
- entities: `OrderPaycoDetailRequest`·`OrderPaycoDetailResponse`·fetch/usePaycoDetail(mutation).
- 스크린: `PaycoPaymentCard` 예약번호 row에 결제 상세정보 버튼(step2)·`PaycoDetailModal`(JSON 덤프, legacy 팝업 window.write 대체).
- mock: `POST payco-detail`(샘플 객체).

## Parity 체크리스트
- [ ] pg=payco·step2 예약번호 row에 결제 상세정보 버튼
- [ ] 클릭→PaycoPG 검증 조회→응답 표시(legacy 팝업 = React 모달 JSON 덤프)
- [ ] 검증용 raw 덤프 성격 유지
