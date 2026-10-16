# Vaultn 주문조회 (vaultn_order_view)

O1 영역 Vaultn 주문 관리 단건 조회. 외부 Vaultn API(RetrieveOrder) 응답 표시. #214 genba_order_view 자매(가장 복잡: 깊은 중첩 가격 데이터).

## 원본
- 파일: `pc/_Admin_/order/vaultn_order_view.php` (라이브, 변형/테스트 파일 없음)
- 도메인: `Vaultn::runRetrieveOrder()` (외부 API), `AdminOrder::getOrderItemVaultn()` (`AdminOrder.php:819`, clientOrderReference→orderId 역인덱스)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/vaultn_order_view.php` → `/order/vaultn_order_view`
- 파라미터: `search_type`(ordno | item_order_id), `search_value`
- breadcrumb: 홈 / 주문 / Vaultn 주문 관리 / Vaultn 주문조회. h4 "Vaultn 주문조회"
- sidebar_order.php: Vaultn 주문 관리 그룹 중 주문조회

### 검색필터 (card, col-xl-6)
- 라벨 "검색어"(col-sm-3) + `search_type` select(col-sm-3): **주문번호(ordno)** / **Item Order ID(item_order_id)** + `search_value` input(col-sm-6 ps-0, placeholder "주문번호")
- 제출 버튼 "검색"
- search_value 없으면(미검색) 결과 영역 없음.

### 조회 로직 (legacy 17~47행)
- `search_value` 있을 때만 조회:
  - `item_order_id`: `ordno = search_value`.
  - `ordno`(주문번호): `getOrderItemVaultn(search_value)` 첫 행 `orderId`(!= "") → ordno.
  - `ordno` 있으면 `Vaultn::runRetrieveOrder(ordno)` → rst.
  - `rst->orderId != ""` → `order_info = rst`; 아니면 `order_info = null`.
- **3상태**: 미검색(결과없음) / 조회성공(정보 카드) / 조회실패(alert-danger).

### 결과 표시 (조회성공: col-xl-6 단일 카드, table col-label 30%/col-value 70%)
- 기본 5행: orderId / clientOrderReference / clientCustomerReference / **Created**(DateTime UTC→Asia/Seoul 'Y-m-d H:i:s') / status
- **orderDetails**(nested-container) 6번째 행 = 중첩:
  - sub-table 7행: salesCurrency / salesCountry / salesCountryCode / **salesPriceGross**(`number_format((int))`) / **salesPriceNet**(값 있으면 `number_format((int))`, falsy면 "") / appliedDiscountPercentage(raw) / **appliedDiscountAmount**(값 있으면 `number_format((int))`, falsy면 "")
  - **priceListDetails**(nested-card, title "priceListDetails", sub-table size-sm 15행): publisherName / publisherGuid(text-break) / priceModel / priceListGuid(text-break) / countryCode / srpCurrency / purchasePriceCurrency / **baseSRP**(int) / **discountedSRP**(int) / **netDiscountedSRP**(`number_format((float),2)`) / priceListVAT(raw) / **basePurchasePrice**(float,2) / promoPercentage(raw) / **netPurchasePrice**(float,2) / **estimatedMargin**(float,2)
- **조회실패**(order_info===null): `<div class="alert alert-danger">{genba_error} : 주문 정보를 찾을 수 없습니다.</div>` — **legacy 버그**: 변수 `$genba_error`는 이 파일에서 미설정(`$vaultn_error` 오타)이라 **항상 빈 접두** 출력 → 그대로 이식(빈 접두 + " : 주문 정보를 찾을 수 없습니다.").

### 페이지 전용 CSS (legacy `<style>`)
- `.col-label`(30%), `.col-value`(70%), `.text-break`(word-break: break-all — GUID 오버플로 방지), `.nested-container`, `.sub-table`, `.sub-col-key`, `.sub-col-val`, `.nested-card`(bg #f1f3f5, padding 14px, radius 4px, border), `.nested-card .card-title`(bold), `.size-sm`(13px), `.size-sm td`(padding 1px 0) — 그대로 이식(컴포넌트 로컬 `<style>`).

## 데이터 (legacy)
- `Vaultn::runRetrieveOrder($ordno)` — 외부 Vaultn API. 응답: orderId/clientOrderReference/clientCustomerReference/Created/status/orderDetails{salesCurrency,salesCountry,salesCountryCode,salesPriceGross,salesPriceNet,appliedDiscountPercentage,appliedDiscountAmount,priceListDetails{publisherName,publisherGuid,priceModel,priceListGuid,countryCode,srpCurrency,purchasePriceCurrency,baseSRP,discountedSRP,netDiscountedSRP,priceListVAT,basePurchasePrice,promoPercentage,netPurchasePrice,estimatedMargin}}
- `getOrderItemVaultn($ordno)`: `select * from tbl_order_item_vaultn where clientOrderReference=:clientOrderReference order by clientOrderReference asc`, 첫 행 `orderId`

## API 계약 (백엔드 전달)

### `GET /admin/order/vaultn-order-view`
- 요청: `search_type`(ordno|item_order_id), `search_value`
- 백엔드 책임:
  - `ordno`면 `tbl_order_item_vaultn.clientOrderReference = search_value` 첫 행 `orderId`를 RetrieveOrder에 사용. `item_order_id`면 search_value 직접.
  - Vaultn `RetrieveOrder` 호출. `Created` → `created`("Y-m-d H:i:s", UTC→Asia/Seoul). 가격은 숫자(정수/실수) 그대로.
  - `rst.orderId != ""` → `found:true`. 아니면 `found:false`.

**응답 200 (조회성공)**
```json
{
  "found": true,
  "order": {
    "order_id": "VAULTN-ORD-1001",
    "client_order_reference": "ORD2026VN01",
    "client_customer_reference": "member12345",
    "created": "2026-07-29 23:33:02",
    "status": "Completed",
    "order_details": {
      "sales_currency": "KRW", "sales_country": "South Korea", "sales_country_code": "KR",
      "sales_price_gross": 55000, "sales_price_net": 50000,
      "applied_discount_percentage": "10", "applied_discount_amount": 5000,
      "price_list_details": {
        "publisher_name": "CD PROJEKT", "publisher_guid": "a1b2-...", "price_model": "Fixed",
        "price_list_guid": "c3d4-...", "country_code": "KR", "srp_currency": "EUR",
        "purchase_price_currency": "EUR", "base_srp": 60, "discounted_srp": 54,
        "net_discounted_srp": 49.09, "price_list_vat": "10", "base_purchase_price": 40.00,
        "promo_percentage": "5", "net_purchase_price": 38.50, "estimated_margin": 10.59
      }
    }
  },
  "error": ""
}
```

**응답 200 (조회실패)**
```json
{ "found": false, "order": null, "error": "Order not found" }
```

## 타겟 매핑
- 라우트: `src/routes/order/vaultn_order_view.tsx` → `/order/vaultn_order_view` (validateSearch: search_type/search_value)
- 스크린: `screens/order-vaultn-view` (로컬 `<style>` 이식)
- entities: `entities/order` 확장 — `OrderVaultnViewInfo`/`OrderVaultnViewOrderDetails`/`OrderVaultnViewPriceList`/`OrderVaultnViewResponse`/`OrderVaultnViewSearch`, `fetchOrderVaultnView`/`useOrderVaultnView`(enabled = search_value≠"")
- mock: `shared/mocks/handlers/order.ts` 확장(`GET /admin/order/vaultn-order-view`)
- 표시 변환: `number_format((int))`→`Math.trunc(n).toLocaleString("en-US")`, `number_format((float),2)`→`toLocaleString("en-US",{min/maxFractionDigits:2})`, 조건부 빈값(salesPriceNet/appliedDiscountAmount) truthy 체크, created 백엔드 포맷

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(2옵션)·정보테이블(기본5+orderDetails 7+priceListDetails 15)·페이지 CSS
- [ ] 필드/검증 일치 — 3상태·정수/실수 포맷 구분·조건부 빈값·text-break GUID·Created UTC→KST·**alert 빈 접두 버그**
- [ ] 분기/플로우 일치 — search_value 없으면 결과없음·ordno→orderId 역인덱스/item_order_id 직접(백엔드)·orderId!="" 판정
- [ ] 엣지케이스 일치 — 조회실패 빈 접두 alert·search_type/search_value 폼 유지·중첩 카드 레이아웃
