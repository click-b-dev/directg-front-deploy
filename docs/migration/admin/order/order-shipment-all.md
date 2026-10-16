# 배송통합 리스트 (order_shipment_all)

O1 영역 배송 주문 관리 v2 첫 화면. 택배 계열(delivery_type≠1) 배송 주문. tbl_order_shipment 3중 조인.

## 원본
- 파일: `pc/_Admin_/order/order_shipment_all.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderShipmentAll()`, `getOrderStatus()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/order_shipment_all.php` → 타겟 `/order/order_shipment_all`
- 파라미터(GET): `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label`, `search_shipment_status`
- breadcrumb: 홈 / 주문 / 주문 관리 / 배송통합 리스트. h4 "배송통합 리스트"

### 검색필터 (card)
- 검색어: `search_key`(select, 결제번호 first — cancel 계열과 동일 4종) + `search_value`
- 기간검색: daterangepicker. **프리셋 세트 상이**: 선택/오늘/어제/지난 7일/**지난달/지난해**/직접선택 (지난 30일·이번달 없음, **지난해 추가**). autoApply:false, 기본 라벨 "선택".
- **배송상태(`search_shipment_status`) radio**: 배송대기(2)/배송준비(3)/배송중(4)/배송완료(5)/구매확정(6). **전체(all) 주석처리 → radio에 없음**. 기본 미체크(빈값=전체). `<h6>` 라벨(다른 화면은 label).

### 검색·기본값 로직 (order_shipment_all.php 21~92)
1. `page` 없으면 1.
2. **날짜 기본값 quirk**: start 빈값 → **지난달 1일**(`mktime(...,date("m")-1,1,...)` → `date('Y-m-01')`), end 빈값 → **이번달 말일**(`date('Y-m-t')`). date_label 기본 "선택".
3. `search_value` 있으면 `search_key`에 따라 `a.settle_no`/`b.ordno`/`b.product_code`/`a.m_id` 등호 + 기간무시(전체기간).
4. 없으면 `a.ord_ymd >= / <=`.
5. `search_shipment_status != 'all' && != ""` → `c.shipment_status =` 등호.
6. 정렬 `order_item_id desc`.

### 목록 (table, 11컬럼)
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. 주문일자 (order_date)
3. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관)
4. 주문번호 (ordno)
5. 회원아이디 (m_id, text-start) — IP 없음
6. **상품코드** (product_code) — 별도 컬럼
7. **상품명** (is_mobile=Y면 M뱃지 + product_name) — text-start
8. 주문금액 (price, number_format, text-end)
9. 주문상태 = `getOrderStatus(status)`
10. **배송상태** = `shipment_status_text[shipment_status]` (로컬 배열: 2배송대기/3배송준비/4배송중/5배송완료/6구매확정)
11. 수령여부 (is_actv=="1" ? O : X)

- 상단 "N 개", 20/page, ServerPagination
- 엑셀다운로드 버튼 주석처리(미노출) — 제외

## 데이터 (legacy)
- `AdminOrder::getOrderShipmentAll($page,$add_where,$orderby,$param)`
- SQL: `select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no inner join tbl_order_shipment c on a.settle_no=c.settle_no and b.ordno=c.ordno where a.step='2' and b.status='2' and b.delivery_type<>'1' <add_where> order by order_item_id desc`
  - **3중 조인** + `step='2' AND b.status='2' AND delivery_type<>'1'`(택배 계열) 고정, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/shipment-all`
목록 조회. 빈값 미전송, search_value 우선 기간무시는 프론트 정규화.

**요청 쿼리**
| 파라미터 | 규칙 |
|----------|------|
| `page` | 기본 1 |
| `search_key`+`search_value` | value 있을 때 동반(settle_no/ordno/product_code/m_id 등호) |
| `search_shipment_status` | 2~6 → `c.shipment_status =` (빈값/all 미전송) |
| `search_start_date`/`search_end_date` | 있으면 `a.ord_ymd >= / <=` |

- **백엔드 책임**: 3중 조인, `a.step='2' AND b.status='2' AND b.delivery_type<>'1'`, `ORDER BY order_item_id DESC`, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "order_date": "2026-07-20 10:03:11",
      "settle_no": "20260720ABC",
      "ordno": "ORD20260720001",
      "m_id": "hong@example.com",
      "product_code": "GOPT12345",
      "product_name": "닌텐도 스위치 조이콘",
      "is_mobile": "N",
      "price": 89000,
      "status": "2",
      "shipment_status": "2",
      "is_actv": "0"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 45, "total_pages": 3 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_shipment_all.tsx` → `/order/order_shipment_all` (validateSearch)
- 스크린: `screens/order-shipment-all` (`OrderShipmentAllScreen`)
- entities: `entities/order` 확장 — `OrderShipmentItem`/`OrderShipmentAllResponse`/`OrderShipmentAllSearch`, `SHIPMENT_STATUS_LABEL`/`SHIPMENT_STATUS_OPTIONS`, `SHIPMENT_PRESET_KEYS`, `resolveOrderShipmentAllSearch`(기본 지난달1일~이번달말일), `fetchOrderShipmentAll`/`useOrderShipmentAll`. `ORDER_CANCEL_SEARCH_KEY_OPTIONS`/`getOrderStatusLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`(**`presetKeys` prop 추가** — 배송 프리셋 세트)·`ServerPagination` 재사용
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/shipment-all`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(배송상태 radio 5종, 전체 없음)·11컬럼(상품코드/상품명 별도)
- [ ] 필드/검증 일치 — 기본 지난달1일~이번달말일·search_value 기간무시·배송상태 필터·프리셋 세트(지난해)
- [ ] 분기/플로우 일치 — order_item_id desc·20/page·번호 ×20·배송상태 라벨·수령여부 O/X
- [ ] 엣지케이스 일치 — 빈 목록·M뱃지·settle_no 링크 미이관·엑셀버튼 미노출
