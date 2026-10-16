# 주문 상세 — 관리자 메모 (217f)

order_view.php 주문 히스토리 card-footer 메모 등록 폼(memo_add). 217a에서 유보한 card-footer를 복원한다.

## 원본
- 폼: order_view.php 1513~1549 (주문 히스토리 card-footer) adminFrm mode=memo_add {settle_no, admin_id(세션), memo_gubun(select 일반/취소환불/차액환불), ordno(input required), message(textarea required)}.
- submit JS(2498~2516): `#adminFrm` submit → e.preventDefault → confirm("메모를 기록하겠습니까") → POST adminFrm.serialize() → **성공 시 location.reload() 주석처리(미갱신 quirk)**.
- order_ps `memo_add`(tbl_order_log insert). **백엔드**(admin_id 세션).

## 화면 (주문 히스토리 card-footer)
- row(gy-2 gx-2): col-3 처리유형(memo_gubun select 일반/취소환불/차액환불, form-floating) / col-9 주문번호(ordno input required) / col-10 내용(message textarea required) / col-2 기록하기 버튼
- 제출 → confirm "메모를 기록하겠습니까" → memo_add. **legacy는 reload 안 함** → 목록 즉시 미갱신(parity 유지, invalidate 없음).

## API 계약
- `POST /admin/order/memo-add` — `{settle_no, memo_gubun, ordno, message}`. admin_id는 백엔드 세션. 성공 `{success}`. **상세 재조회 안 함**(legacy quirk).

## 타겟 매핑
- entities: `OrderMemoAddRequest`·fetch/useOrderMemoAdd(**invalidate 없음**).
- 스크린: 주문 히스토리 card-footer에 `OrderMemoForm`(제어).
- mock: `POST memo-add`.

## Parity 체크리스트
- [ ] card-footer 메모 폼 복원(처리유형/주문번호/내용/기록하기)
- [ ] memo_gubun 3옵션·ordno·message required
- [ ] confirm "메모를 기록하겠습니까"→memo_add
- [ ] 성공 시 목록 미갱신(legacy reload 주석 quirk 이식)·admin_id 백엔드
