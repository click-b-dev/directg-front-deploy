# Ztorm 주문조회 (ztorm_order_view)

O1 영역 Ztorm 주문 관리 단건 조회. 외부 Ztorm API(`GetOrder`) 응답을 표시. #209 order_asset_key(단건 조회) 자매 성격이나 데이터 출처가 외부 API.

## 원본
- 파일: `pc/_Admin_/order/ztorm_order_view.php` (라이브, 변형/테스트 파일 없음)
- 도메인: `Ztorm::runGetOrder()` (`src/classes/Ztorm.php:450`, `curlPost("GetOrder", params)`), `AdminOrder::getOrderZtormSuccess()` (item_order_id→ordno 역인덱스)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/ztorm_order_view.php` → `/order/ztorm_order_view`
- 파라미터: `search_type`(ordno | item_order_id), `search_value`
- breadcrumb: 홈 / 주문 / Ztorm 주문 관리 / Ztorm 주문조회. h4 "Ztorm 주문조회"
- sidebar_order.php: Ztorm 주문 관리 그룹(주문대기·주문완료·주문실패·**주문조회**) 중 주문조회

### 검색필터 (card, col-xl-6)
- 라벨 "검색어"(col-sm-3) + `search_type` select(col-sm-3): **주문번호(ordno)** / **Item Order ID(item_order_id)** + `search_value` input(col-sm-6 ps-0)
- 제출 버튼 "검색"
- search_value 없으면(미검색) 결과 영역 없음.

### 조회 로직 (legacy 17~52행)
- `search_value` 있을 때만 조회:
  - `search_type == "item_order_id"`: `getOrderZtormSuccess(1, " AND customer_product_id = {search_value}", 1, "")`로 첫 행 `ordno` 획득(NULL이면 0).
  - 그 외(ordno): `ordno = search_value`.
  - `Ztorm::runGetOrder(RetailerOrderID=ordno)` 호출 → 외부 API.
  - `ErrorCode == 0` → `order_info = Value->Order`; 아니면 `order_info = null`(에러 메시지 `$ztorm_error` = API echo 출력 캡처).
- **3상태**: 미검색(`""` — 결과 없음) / 조회성공(정보 테이블) / 조회실패(`null` — alert-danger).

### 결과 표시
- **조회성공** (info card col-xl-6, table 2컬럼 30%/70%, 14행):
  1. CountryCode, 2. CustomerIP, 3. **EndTime** (`date('Y-m-d H:i:s', EndTime.UnixTimestamp)`), 4. IsTest, 5. IsRefund, 6. RetailerCustomerID, 7. RetailerOrderID, 8. CustomerProductID (`Contents.OrderContent.CustomerProducts.CustomerProductID`), 9. IsRefunded (`Contents.OrderContent.IsRefunded`), 10. ProductID (`Contents.OrderContent.ProductID`), 11. **ProductPriceExVAT** (`number_format((int)Value)` + Currency), 12. **ProductPriceIncVAT** (number_format Value + Currency), 13. VATPercent
- **조회실패** (order_info===null): `<div class="alert alert-danger">{ztorm_error} : 주문 정보를 찾을 수 없습니다.</div>`

## 데이터 (legacy)
- `Ztorm::runGetOrder($params)` — `curlPost("GetOrder", {RetailerOrderID})` → `{ErrorCode, ErrorMsg, Value: {Order: {...}}}`
- item_order_id 역인덱스: `select * from tbl_order_item_ztorm where 1 AND customer_product_id = <val> order by 1`(getOrderZtormSuccess 재사용), 첫 행 `ordno`

## API 계약 (백엔드 전달)

### `GET /admin/order/ztorm-order-view`
- 요청: `search_type`(ordno|item_order_id), `search_value`
- 백엔드 책임:
  - `item_order_id`면 `tbl_order_item_ztorm.customer_product_id = search_value` 첫 행의 `ordno`(없으면 0)를 RetailerOrderID로 사용. `ordno`면 search_value 그대로.
  - Ztorm `GetOrder` API 호출(`RetailerOrderID`), `EndTime.UnixTimestamp` → `end_time`("Y-m-d H:i:s") 포맷, 가격 `Value`는 정수.
  - `ErrorCode==0` → `found:true`+order. 아니면 `found:false`+`error`(ErrorMsg).
- 에러 문자열: legacy는 API echo 메시지(`ErrorMsg`)를 그대로 노출.

**응답 200 (조회성공)**
```json
{
  "found": true,
  "order": {
    "country_code": "KR",
    "customer_ip": "203.0.113.10",
    "end_time": "2026-07-20 14:33:02",
    "is_test": "0",
    "is_refund": "0",
    "retailer_customer_id": "member12345",
    "retailer_order_id": "ORD2026ZT01",
    "customer_product_id": "CPID-77-001",
    "is_refunded": "false",
    "product_id": "88123",
    "product_price_ex_vat_value": 45000,
    "product_price_ex_vat_currency": "KRW",
    "product_price_inc_vat_value": 49500,
    "product_price_inc_vat_currency": "KRW",
    "vat_percent": "10"
  },
  "error": ""
}
```

**응답 200 (조회실패)**
```json
{ "found": false, "order": null, "error": "Order not found" }
```

## 타겟 매핑
- 라우트: `src/routes/order/ztorm_order_view.tsx` → `/order/ztorm_order_view` (validateSearch: search_type/search_value)
- 스크린: `screens/order-ztorm-view`
- entities: `entities/order` 확장 — `OrderZtormViewInfo`/`OrderZtormViewResponse`/`OrderZtormViewSearch`, `fetchOrderZtormView`/`useOrderZtormView`(enabled = search_value≠"")
- mock: `shared/mocks/handlers/order.ts` 확장(`GET /admin/order/ztorm-order-view`)
- 표시 변환: 가격 `number_format`→`toLocaleString("en-US")`(천단위 콤마), end_time은 백엔드 포맷 문자열 그대로

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(search_type 2옵션·col-xl-6)·정보 테이블 14행(2컬럼 30/70)
- [ ] 필드/검증 일치 — 3상태(미검색/성공/실패)·가격 콤마+Currency·EndTime 포맷·alert-danger 메시지
- [ ] 분기/플로우 일치 — search_value 없으면 결과 없음·item_order_id→ordno 역인덱스(백엔드)·ErrorCode 분기
- [ ] 엣지케이스 일치 — 조회실패 시 에러 메시지 노출·search_type/search_value 폼 유지
