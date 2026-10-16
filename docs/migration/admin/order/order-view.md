# 주문 상세 (order_view) — 단위 분해 + 1차 읽기전용 뷰

O1 영역 주문 상세. legacy `order_view.php`(2623줄·98KB)는 결제취소·환불·주문취소·재발송·배송·메모·키확인 등 다수 mutation을 포함한 초대형 복합 화면 → **단위 분해**로 이관한다.

## 원본
- 파일: `pc/_Admin_/order/order_view.php` (**라이브** — 리스트들이 `order_view.php?settle_no=`로 링크. `order_view_v2.php`는 참조 0건=미사용, `yjs_order_view.php`=개발본, `order_old_view.php`=DGKR 아카이브 전용)
- POST 처리: `order_ps.php` (중앙 디스패처, mode 스위치)
- 도메인: `AdminOrder`(getOrderInfo/getOrderItem/getOrderAddress/getOrderLog/getOrderItem{Asset,Ztorm,Genba,Vaultn}/getActiveOrderItemPointNexus/getOrderItemDelivery/getOrderItemModelInfo/getShipmentCompany/getCountry 등), `Order`, `AdminV1`, PG SDK(Kcp/Toss/Tosspay/NaverPay/PaycoPG)
- 참조: `docs/legacy-admin/40-order.md`(§주문 상세 75~137·mode표 168~200)

## 진입
- URL: `/order/order_view.php?settle_no=<결제번호>` → `/order/order_view?settle_no=`
- 주 로딩: `getOrderInfo(settle_no)`(결제/주문 헤더) + `getOrderItem(settle_no)`(주문항목) + `getOrderAddress(settle_no)`(배송지) + `getOrderLog(settle_no)`(히스토리). 항목별 delivery_type 1/3이면 order_system별 키 발송현황, 2/3이면 배송현황 로딩. geoip2로 주문 국가.
- breadcrumb: 홈 / 주문 / 주문내역 상세보기. h4 "주문내역 상세보기".

## 전체 화면 구조 (섹션)
1. **주문상품 정보**(전폭 카드) — 항목 표(선택no/주문번호/상품정보/적립/정상가/판매가/주문상태/수령상태/취소처리) + 항목마다 상세행(디지털=키 발송현황 5시스템 / 실물=배송현황)
2. row › **col-lg-4**: 주문자 정보 · 취소 정보(조건) · 결제 정보 · [PG별 결제정보 카드: KCP/토스/토스페이/PAYCO/네이버페이 — **환불 폼**]
3. row › **col-lg-8**: 배송지 정보(zipcode 있을 때) · 주문 히스토리(+메모 폼) · [PG 히스토리: 네이버페이/토스/토스페이 — 외부 API]
4. 모달: order-cancel-modal(주문취소) · 환불 폼(kcp/toss/toss_adapter/tosspay/payco/naverpay) · 각종 JS

## mutation·외부연동 전수 (mode / 대상)
- `resend`(재발송) · `register_tracking_no_item`(운송장 등록) · `kcp_refund` · `toss_adapter_refund` · `toss_refund` · `tosspay_refund` · `payco_refund` · `naverpay_refund` · `memo_add`(메모) · `order_item_cancel`(주문취소) · reject(반려, btn_reject) · 사용적립금 반환(btn_point_refund/btn_order_refund)
- AJAX: 키확인(`getAssetLicence`/`getPointNexusLicence`/…, `*_json.php` 모달) · 배송조회(btn_delivery_search) · 결제 상세정보(order_detail.php)
- 외부 PG 실시간: NaverPay `naverPayPaymentsHistory` · Toss `viewPayment` · Tosspay `viewPayment`

## 단위 분해 (권장 순서)
- **217a (본 단위): 읽기전용 상세 뷰** — 페이지 골격 + 주문상품 정보(표+디지털/실물 발송현황 **표시**) + 주문자 정보 + 취소 정보 + 결제 정보(일반) + 배송지 정보 + 주문 히스토리(표시). **액션 버튼·모달·PG 결제/히스토리 카드·mutation·AJAX 전부 제외.**
- 217b: 키확인 AJAX(getAsset/Ztorm/Genba/Vaultn/PointNexus Licence 모달)
- 217c: 결제취소/환불 그룹(PG별 결제정보 카드 + kcp/toss/toss_adapter/tosspay/payco/naverpay refund + 사용적립금 반환) + PG 외부 히스토리 카드
- 217d: 주문취소(order_item_cancel 모달) + 반려(reject)
- 217e: 재발송(resend) + 운송장 등록(register_tracking_no_item) + 배송조회
- 217f: 관리자 메모(memo_add)

---

# 217a — 읽기전용 상세 뷰 (본 단위 스코프)

## 포함 섹션 (표시 전용)
### 주문상품 정보 (전폭)
- 헤더 9컬럼: 선택(순번 i)/주문번호(ordno)/상품정보(product_code+product_name, goods_option_list 링크)/적립(repay nf)/정상가(goods_price nf 원)/판매가(price nf 원)/주문상태(getOrderStatus, status 8·9면 text-danger fw-bold)/수령상태(is_actv=1 "수령완료"+completion_date, 아니면 "미수령")/취소처리(**액션 버튼 제외** — 후속 단위)
- 항목마다 상세행(colspan=9):
  - **디지털상품**(delivery_type 1/3): 발송현황 표(주문시스템/Item ID/Item Name/Item Platform/Item Publisher/Item Order ID/Status/키확인). 시스템별 행:
    - Asset: asset_id/asset_name/asset_platform/asset_publisher/reserve_id
    - Ztorm: ztorm_item_id/ztorm_item_name/ztorm_publisher/ztorm_platform/customer_product_id(hub 외부링크)
    - Genba: Sku/Name/Platform/Publisher/ID(genba_order_view 링크)+ClientTransactionID/State(0품절·1예약구매·2주문완료·3환불완료)
    - Vaultn: sku/Name/provider/publisherName/orderId/status
    - PointNexus: action(뱃지 색)/productID/Name/license_platform/operationID(+parent)/status(뱃지 색)+수령일
    - **키확인 버튼 제외**(후속). 외부 링크(hub/genba_order_view/pointnexus_operation)는 표시 유지.
  - **실물상품**(delivery_type 2/3): 배송현황 표(상품정보 model_code/model_name/배송상태 getShipmentStatus·8·9 red/운송장번호+택배사/주문일자/배송시작·완료·구매확정 일자/배송조회). **배송조회 버튼·운송장 등록 폼 제외**(후속).
- 하단 누적: total_price(Σprice), cancel_request/finish(건·금액, status 8/9) — **프론트 계산**.

### 주문자 정보 (col-lg-4)
- 회원 고유번호(m_no)/회원 ID(m_id, member_view 링크)/주문경로(is_mobile N=PC·else 모바일)/주문 IP(ip)/주문 국가(country, geoip 백엔드)

### 취소 정보 (조건: cancel_request>0 || cancel_finish>0)
- 취소요청(cancel_request_price nf 원, cancel_request 건)/취소완료(cancel_finish_price nf 원, cancel_finish 건) — 프론트 계산

### 결제 정보 (col-lg-4)
- 주문생성일(reg_date)/결제번호(settle_no + 번호복사 버튼)/결제PG(pg_provider)/결제수단(getSettlekindLabel)/총 주문금액(total_price 프론트계산 nf 원)/총 할인금액(use_emoney+use_cash+member_dc nf 원, 상세 문구)/최종 결제금액(order_data.total_price nf 원)/결제상태(getCheckoutStatus step 뱃지)/결제완료일자(step≠1이면 payment_date)
- **제외**(후속): 사용적립금 반환 버튼(btn_point_refund/btn_order_refund), 아임포트 주문번호(settle_log 의존)

### 배송지 정보 (col-lg-8, 조건: order_address_data.zipcode)
- 우편번호(zipcode)/주소(address+address_detail)/주문자(name)/휴대폰번호(tel) + 배송요청 메시지(msg)

### 주문 히스토리 (col-lg-8)
- 표: 주문번호(ordno)/처리자(admin_id)/처리일자(reg_date)/내용(memo) — order_log 반복
- **제외**(후속): card-footer 메모 등록 폼(memo_add)

## API 계약 (백엔드 전달) — 집계 상세 조회

### `GET /admin/order/detail?settle_no=<settle_no>`
- 백엔드: getOrderInfo(주문/결제 헤더) + getOrderItem(항목) + 항목별 발송현황(delivery_type 1/3: Asset/Ztorm/Genba/Vaultn/PointNexus, 2/3: delivery+model_info+shipment_company) + getOrderAddress + getOrderLog + getCountry(ip, geoip). 미존재 settle_no → 빈 order(null) 처리.
- 응답 필드는 아래 타입 매핑 참조. 라벨(getOrderStatus/getCheckoutStatus/getSettlekindLabel/getShipmentStatus)은 프론트 기존 `entities/order` 라벨맵 재사용.

**응답 200(요약)**
```json
{
  "order": { "settle_no": "...", "m_no": "...", "m_id": "...", "is_mobile": "N", "ip": "...", "country": "대한민국",
    "reg_date": "...", "pg_provider": "kcp", "payment_method": "SC0010",
    "use_emoney": 0, "use_cash": 0, "member_dc": 0, "total_price": 45000, "step": "2", "payment_date": "...", "version": "3" },
  "items": [ { "ordno":"...", "product_code":"...", "product_name":"...", "repay":0, "goods_price":50000, "price":45000,
    "status":"2", "is_actv":"1", "completion_date":"...", "delivery_type":"1", "order_system":"Asset", "send_status":"",
    "order_date":"...",
    "asset":[{"asset_id":"","asset_name":"","asset_platform":"","asset_publisher":"","reserve_id":""}],
    "ztorm":[{"ztorm_item_id":"","ztorm_item_name":"","ztorm_publisher":"","ztorm_platform":"","customer_product_id":""}],
    "genba":[{"sku":"","name":"","platform":"","publisher":"","id":"","client_transaction_id":"","state":"2"}],
    "vaultn":[{"sku":"","name":"","provider":"","publisher_name":"","order_id":"","status":""}],
    "pointnexus":[{"action":"sell","product_id":"","name":"","license_platform":"","operation_id":"","parent_operation_id":"","status":"sold","mode":"","idx":""}],
    "delivery":[{"model_code":"","model_name":"","shipment_status":"5","tracking_number":"","shipment_company_name":"CJ","shipped_date":"","estimated_delivery_date":"","actual_delivery_date":"","delivery_code":"001"}]
  } ],
  "address": { "zipcode":"","address":"","address_detail":"","name":"","tel":"","msg":"" },
  "logs": [ { "ordno":"","admin_id":"","reg_date":"","memo":"" } ]
}
```

## 타겟 매핑
- 라우트: `src/routes/order/order_view.tsx` → `/order/order_view` (validateSearch: settle_no)
- 스크린: `screens/order-detail`
- entities: `entities/order` 확장 — `OrderDetail*` 타입(Info/Item/Fulfillment 5종/Delivery/Address/Log/Response), `fetchOrderDetail`/`useOrderDetail`(enabled = settle_no≠""). 라벨은 기존 getOrderStatusLabel/getCheckoutStatusLabel/getSettleKindLabel/getShipmentStatusFullLabel 재사용.
- mock: `shared/mocks/handlers/order.ts` 확장(`GET /admin/order/detail`)

## Parity 체크리스트 (217a)
- [ ] 화면 요소 일치 — breadcrumb·h4·주문상품 표(9컬럼·디지털/실물 상세행)·주문자/취소/결제/배송지/히스토리 카드·레이아웃(전폭+4/8)
- [ ] 필드/검증 일치 — nf 콤마·라벨(주문상태/결제상태/결제수단/배송상태)·status 8·9 red·is_actv 수령·State 라벨·PointNexus 뱃지색
- [ ] 분기/플로우 일치 — delivery_type 1/3 디지털·2/3 실물·취소정보 조건·배송지 zipcode 조건·결제완료일자 step≠1·total/cancel 프론트 계산
- [ ] 제외 항목 명시 — 액션 버튼/모달/PG 결제·히스토리 카드/mutation/키확인·배송조회·메모폼·아임포트번호·사용적립금 반환은 217b~f 후속
