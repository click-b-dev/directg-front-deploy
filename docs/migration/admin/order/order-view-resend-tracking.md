# 주문 상세 — 재발송/운송장/배송조회 (217e)

order_view.php 재발송(resend)·운송장 등록(register_tracking_no_item)·배송조회(courier trace). 217a에서 유보한 실물 배송표 배송조회 컬럼·운송장 폼을 복원한다.

## 원본
- **재발송**: order_view.php 240~248 (취소처리 컬럼, `step=="2" && (delivery_type 1||3) && send_status=="fail" && status=="1"`) form mode=resend {settle_no, ordno}, onsubmit confirm "[ordno] 이 상품을 재발송(키발급 재시도)하시겠습니까?" → order_ps → reload.
- **운송장 등록**: 478~498 (실물 배송표) deliveryFrm mode=register_tracking_no_item {settle_no, ordno, escw_yn(settle_log), payment_method(order), delivery_code(001 CJ/002 로젠), tracking_no}. submit JS(2518~2537) confirm "운송장번호를 입력하시겠습니까?" → reload.
- **배송조회**: 475 btn_delivery_search data-trackingno(str_replace("-","",tracking_number))/data-deliverycode. JS(2309~2335): delivery_code=="002"면 epost(sid1) POST, else CJ(slipno) POST, target _blank. → `shared/lib/delivery-tracking.openDeliveryTracking(trackingNo, deliveryCode)` 재사용(동일 구현).
- order_ps `resend`(키발급 재시도)·`register_tracking_no_item`(운송장 등록·에스크로 배송등록). **백엔드**.

## 화면
- **취소처리 컬럼**: 취소/반려(217d) 뒤에 `<hr>`+재발송 버튼(btn-warning, 조건 충족 시).
- **실물 배송표**: 배송조회 컬럼(8번째) 복원 + 배송조회 버튼(openDeliveryTracking). 각 배송행 아래 "운송장 정보" 행(delivery_code select CJ/로젠 + tracking_no input + 등록 버튼) 복원.

## API 계약
- `POST /admin/order/resend` — `{settle_no, ordno}`. 성공 `{success}` → 상세 재조회.
- `POST /admin/order/tracking-register` — `{settle_no, ordno, escw_yn, payment_method, delivery_code, tracking_no}`. 성공 → 상세 재조회.
- 배송조회는 외부 택배사(CJ/우체국) POST(클라이언트), 백엔드 무관.

## 타겟 매핑
- entities: `OrderResendRequest`·`OrderTrackingRegisterRequest`·fetch/useOrderResend·useTrackingRegister.
- 스크린: 재발송 버튼(취소처리 컬럼)·`PhysicalDeliveryTable`(배송조회 컬럼+`TrackingRegisterForm`)·`openDeliveryTracking` 재사용.
- mock: `POST resend`·`tracking-register`.

## Parity 체크리스트
- [ ] 재발송 조건(step2·디지털·send_status fail·status 1)·confirm 문구·resend→재조회
- [ ] 운송장 폼(CJ/로젠·번호)·confirm→register_tracking_no_item(escw_yn/payment_method 포함)→재조회
- [ ] 배송조회(하이픈 제거·delivery_code별 CJ/우체국 외부 POST)
- [ ] 배송표 배송조회 컬럼 복원(8컬럼)
