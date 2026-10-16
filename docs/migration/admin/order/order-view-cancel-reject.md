# 주문 상세 — 주문취소/반려 (217d)

order_view.php 주문상품 표의 취소처리 컬럼 복원 + 주문취소 모달(order_item_cancel) + 반려(order_reject). 217a에서 유보한 취소처리 컬럼을 복원한다.

## 원본
- 취소 버튼: order_view.php 234 (item row, `status!="9"`) `btn_cancel` data-ordno/data-system/data-productname/data-delivery_type → `#order-cancel-modal`
- 반려 버튼: 236 (item row, `status=="8"`) `btn_reject` data-settleno/data-ordno/data-adminid/data-settlemethod
- 모달: 2140~2197 `#order-cancel-modal`(cancelFrm mode=order_item_cancel)
- 모달 채우기 JS(2539~2558): ordno/product_name/order_system/delivery_type; system=="Ztorm"이면 notice "Ztorm 주문은 Hub에서 별도로 주문취소 하셔야 합니다." else "".
- 취소 완료 JS(2422~2439): `#btn_order_cancel` → POST cancelFrm(mode=order_item_cancel, settle_no, delivery_type, product_name, ordno, order_status="주문취소", order_system, admin_id, message) → reload.
- 반려 JS(2478~2496): `.btn_reject` → confirm("해당 취소요청 주문을 반려처리 하시겠습니까?") → POST {mode=order_reject, settle_no, ordno, admin_id, payment_method} → reload.
- order_ps `order_item_cancel`(주문항목 취소)·`order_reject`(취소요청 반려). **백엔드**.

## 화면
- **취소처리 컬럼**(9번째, 217a 유보분 복원): 취소 버튼(`status!="9"`, btn-danger) + `<hr>`+반려 버튼(`status=="8"`, btn-success). 재발송(`btn-warning`)은 **217e 후속**.
- **주문취소 모달**(bg-danger "주문취소"): 주문상품(product_name readonly)/주문번호(ordno readonly)/주문처리("주문취소" readonly)/주문시스템(order_system readonly + Ztorm notice)/처리자(admin_id readonly, 세션 관리자 — **백엔드**)/처리사유(message textarea). "취소 완료" → order_item_cancel.
- **반려**: 모달 없음. confirm 후 즉시 order_reject.

## API 계약
- `POST /admin/order/item-cancel` — `{settle_no, ordno, delivery_type, order_system, message}`. admin_id/order_status("주문취소")는 백엔드(세션·고정). 성공 `{success}` → 상세 재조회.
- `POST /admin/order/reject` — `{settle_no, ordno, payment_method}`. admin_id는 백엔드. 성공 → 상세 재조회.

## 타겟 매핑
- entities: `OrderItemCancelRequest`·`OrderRejectRequest`·fetch/useOrderItemCancel·useOrderReject.
- 스크린: 취소처리 컬럼(th+td)·detail row colSpan 8→9·`OrderCancelModal`(제어)·handleReject.
- mock: `POST item-cancel`·`reject`.

## Parity 체크리스트
- [ ] 취소처리 컬럼 복원·취소(status≠9)·반려(status==8)·재발송은 후속 제외
- [ ] 주문취소 모달 필드·Ztorm notice·처리사유·취소 완료→order_item_cancel→재조회
- [ ] 반려 confirm→order_reject(settle_no/ordno/payment_method)→재조회
- [ ] 처리자(admin_id)는 백엔드 세션(표시 필드는 빈값)
