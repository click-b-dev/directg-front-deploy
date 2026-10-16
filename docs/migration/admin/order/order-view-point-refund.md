# 주문 상세 — 적립금반환/아임포트번호 (217g)

order_view.php 결제 정보 카드: 사용적립금 반환(point_refund)·결제취소+적립금반환(order_refund) 버튼 + 아임포트 주문번호 행.

## 원본
- 총 할인금액 row(644~656): `($pg_provider=="DGKR" && $payment_method=="DG0000") && use_emoney>0` → btn_order_refund "결제취소+사용적립금 반환"; else if `use_emoney>0` → btn_point_refund "사용적립금 반환". data-settleno/data-useemoney.
- 아임포트 주문번호 row(672~681): `if(settle_log['imp_uid'])` → 아임포트 주문번호(imp_uid).
- JS: btn_point_refund(2441) confirm "해당 결제시 할인에 사용된 적립금을 반환(환불)처리 하시겠습니까?" → {mode:point_refund, settle_no, use_emoney} → reload. btn_order_refund(2460) confirm "결제를 취소하고 사용된 적립금을 반환(환불)처리 하시겠습니까?" → {mode:order_refund, settle_no, use_emoney} → reload.
- order_ps `point_refund`(적립금 반환)·`order_refund`(결제취소+반환). **백엔드**.

## API 계약
- 상세 `settle_log`(superset)에 `imp_uid` 추가.
- `POST /admin/order/point-refund` / `POST /admin/order/order-refund` — `{settle_no, use_emoney}`. 성공 `{success}` → 상세 재조회.

## 타겟 매핑
- entities: settle_log.imp_uid·`OrderPointRefundRequest`·fetch/usePointRefund·useOrderRefund.
- 스크린: 결제 정보 카드 총 할인금액 row 버튼(조건)·아임포트 주문번호 row.
- mock: settle_log.imp_uid·`POST point-refund`·`order-refund`.

## Parity 체크리스트
- [ ] DGKR+DG0000+use_emoney>0 → 결제취소+반환 버튼 / else use_emoney>0 → 사용적립금 반환 버튼
- [ ] confirm 문구 2종·point_refund/order_refund→재조회
- [ ] 아임포트 주문번호 행(imp_uid 있을 때)
