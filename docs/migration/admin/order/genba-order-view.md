# Genba 주문조회 (genba_order_view)

O1 영역 Genba 주문 관리 단건 조회. 외부 Genba API(GetOrder/GetOrderByCtid) 응답 표시. #212 ztorm_order_view 자매(더 복잡: 3검색타입·2카드·중첩 Keys·State 범례).

## 원본
- 파일: `pc/_Admin_/order/genba_order_view.php` (라이브, 변형/테스트 파일 없음)
- 도메인: `Genba::runGenbaGetOrderAsync()`/`runGenbaGetOrderByCtidAsync()` (외부 API), `AdminOrder::getOrderItemGenba()` (`AdminOrder.php:807`, ordno→Genba ID 역인덱스)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/genba_order_view.php` → `/order/genba_order_view`
- 파라미터: `search_type`(ordno | item_order_id | client_transaction_id), `search_value`
- breadcrumb: 홈 / 주문 / Genba 주문 관리 / Genba 주문조회. h4 "Genba 주문조회"
- sidebar_order.php: Genba 주문 관리 그룹(예약주문·주문완료·주문실패·**주문조회**) 중 주문조회

### 검색필터 (card, col-xl-6)
- 라벨 "검색어"(col-sm-3) + `search_type` select(col-sm-3): **주문번호(ordno)** / **Item Order ID(item_order_id)** / **ClientTransactionID(client_transaction_id)** + `search_value` input(col-sm-6 ps-0)
- 제출 버튼 "검색"
- search_value 없으면(미검색) 결과 영역 없음.

### 조회 로직 (legacy 17~53행)
- `search_value` 있을 때만 조회. `Genba("Live")`:
  - `client_transaction_id`: `runGenbaGetOrderByCtidAsync(search_value)`.
  - `item_order_id`: `ordno = search_value` → `runGenbaGetOrderAsync(ordno)`.
  - `ordno`(주문번호): `getOrderItemGenba(search_value)` 첫 행 `ID`(Genba Order ID) → `runGenbaGetOrderAsync(ID)`.
  - `rst->ID != ""` → `order_info = rst`; 아니면 `order_info = null`(에러 `$genba_error` = API echo).
- **3상태**: 미검색(결과없음) / 조회성공(2카드) / 조회실패(alert-danger).

### 결과 표시 (조회성공: 2개 col-xl-6 카드 나란히)
- **좌 카드** (정보 테이블, 2컬럼 30/70):
  1. ClientTransactionID, 2. Order ID(ID), 3. ReservationID, 4. Sku, 5. **Created**(`DateTime` UTC→Asia/Seoul 'Y-m-d H:i:s'), 6. **State\***(raw), 7. CommunicatedBuyingPrice(`number_format(Amount)`+CurrencyCode), 8. ActualBuyingPrice(Amount+CurrencyCode), 9. **SellingPrice**(`<del>`GrossAmount CurrencyCode`<br></del>` + NetAmount CurrencyCode), 10. **Keys**(중첩 sub-table: 각 key마다 Code/KeyType/Sku/ProductName 4행 반복)
- **우 카드** (State 범례, 정적 list-group): 0~4 설명 5줄(고정 텍스트)
- **조회실패**(order_info===null): `<div class="alert alert-danger">{genba_error} : 주문 정보를 찾을 수 없습니다.</div>`

### 페이지 전용 CSS (legacy `<style>`)
- `.nested-container`(padding 16px, bg #fff), `.sub-table`(width 100%, border-collapse), `.sub-table td`(padding 2px 0, border none), `.sub-col-key`(width 40%, color #6c757d), `.sub-col-val`(width 60%) — 그대로 이식(컴포넌트 로컬 `<style>`).

## 데이터 (legacy)
- `Genba::runGenbaGetOrderAsync($ordno)` / `runGenbaGetOrderByCtidAsync($ctid)` — 외부 Genba API. 응답 객체: ClientTransactionID/ID/ReservationID/Sku/Created/State/CommunicatedBuyingPrice{Amount,CurrencyCode}/ActualBuyingPrice/SellingPrice{GrossAmount,NetAmount,CurrencyCode}/Keys[]{Code,KeyType,Sku,ProductName}
- `getOrderItemGenba($ordno)`: `select * from tbl_order_item_genba where ordno=:ordno order by ordno asc`, 첫 행 `ID`

## API 계약 (백엔드 전달)

### `GET /admin/order/genba-order-view`
- 요청: `search_type`(ordno|item_order_id|client_transaction_id), `search_value`
- 백엔드 책임:
  - `ordno`면 `tbl_order_item_genba.ordno = search_value` 첫 행 `ID`를 Genba Order ID로 사용 후 GetOrder.
  - `item_order_id`면 search_value를 Genba Order ID로 GetOrder.
  - `client_transaction_id`면 GetOrderByCtid.
  - Genba `Created` → `created`("Y-m-d H:i:s", UTC→Asia/Seoul). 가격 Amount/Gross/Net는 정수.
  - `rst.ID != ""` → `found:true`. 아니면 `found:false`+`error`(API 메시지).

**응답 200 (조회성공)**
```json
{
  "found": true,
  "order": {
    "client_transaction_id": "CTID-2026-0001",
    "order_id": "GENBA-ORD-1001",
    "reservation_id": "GENBA-RSV-2001",
    "sku": "GENBA-SKU-001",
    "created": "2026-07-29 23:33:02",
    "state": "2",
    "communicated_buying_price_amount": 40000,
    "communicated_buying_price_currency": "KRW",
    "actual_buying_price_amount": 39000,
    "actual_buying_price_currency": "KRW",
    "selling_price_gross_amount": 55000,
    "selling_price_net_amount": 49500,
    "selling_price_currency": "KRW",
    "keys": [
      { "code": "XXXX-YYYY-ZZZZ", "key_type": "Steam", "sku": "GENBA-SKU-001", "product_name": "Cyberpunk 2077" }
    ]
  },
  "error": ""
}
```

**응답 200 (조회실패)**
```json
{ "found": false, "order": null, "error": "Order not found" }
```

## 타겟 매핑
- 라우트: `src/routes/order/genba_order_view.tsx` → `/order/genba_order_view` (validateSearch: search_type/search_value)
- 스크린: `screens/order-genba-view` (로컬 `<style>` 이식)
- entities: `entities/order` 확장 — `OrderGenbaViewInfo`/`OrderGenbaViewKey`/`OrderGenbaViewResponse`/`OrderGenbaViewSearch`, `fetchOrderGenbaView`/`useOrderGenbaView`(enabled = search_value≠"")
- mock: `shared/mocks/handlers/order.ts` 확장(`GET /admin/order/genba-order-view`)
- 표시 변환: 가격 `number_format`→`toLocaleString("en-US")`, created는 백엔드 포맷 문자열

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(3옵션)·좌 정보테이블 10행·우 State 범례·중첩 Keys·페이지 CSS
- [ ] 필드/검증 일치 — 3상태·가격 콤마+Currency·SellingPrice del/net·Created UTC→KST·alert-danger 메시지
- [ ] 분기/플로우 일치 — search_value 없으면 결과없음·ordno→ID 역인덱스/item_order_id 직접/ctid 분기(백엔드)·ID!="" 판정
- [ ] 엣지케이스 일치 — Keys 다건 반복·조회실패 에러 노출·search_type/search_value 폼 유지
