# 취소요청 리스트 (order_cancel_request)

O1 영역 주문 관리 v2 4번째 화면. status IN (7,8) 취소요청 목록. order_ready 컬럼 + 검색필터, 기본 전체기간.

## 원본
- 파일: `pc/_Admin_/order/order_cancel_request.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderCancelRequest()`, `getOrderStatus()`, `getDeliveryType()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, [order-all.md](order-all.md)

## 화면·플로우
- 진입 URL: `/order/order_cancel_request.php` → 타겟 `/order/order_cancel_request`
- 파라미터(GET): `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label`
- breadcrumb: 홈 / 주문 / 주문 관리 / 취소요청 리스트. h4 "취소요청 리스트"

### 검색필터 (card)
- 검색어: `search_key`(select) + `search_value`. **select 순서 = 결제번호(search_settle_no)·주문번호(search_ordno)·회원아이디(search_m_id)·옵션상품코드(search_product_code)** — order_all과 순서 상이(결제번호 first). 기본 선택 첫 옵션(search_settle_no).
- 기간검색: daterangepicker. **"전체기간" 프리셋 추가**(ranges 끝, `[null,null]`) — 선택 시 start/end 비우고 date_label="전체기간".

### 검색·기본값 로직 (order_cancel_request.php 20~87)
1. `page` 없으면 1.
2. **날짜 기본값 없음** — start/end 빈값이면 그대로 빈값(전체기간). **date_label 기본 표시 "전체기간"**(JS else 분기).
3. `search_value` 있으면 `search_key`에 따라 `a.settle_no`/`b.ordno`/`b.product_code`/`a.m_id` 등호(조인 alias a/b) + 기간무시(start/end 비움, date_label="전체기간").
4. 없으면: date_label=="전체기간"이면 "" 초기화 → start=="" 이면 date_label="전체기간" 재설정. `a.ord_ymd >= '<start>'`, `a.ord_ymd <= '<end>'`(있을 때).
5. 정렬 `b.order_date desc`.

### 목록 (table, 9컬럼)
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. 주문일자 (order_date)
3. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관)
4. 주문번호 (ordno)
5. 회원아이디 (m_id, text-start) — **IP 없음**
6. 상품정보 (product_code + `<br/>` + is_mobile=Y면 M뱃지 + product_name) — text-start
7. 주문금액 (price, number_format, text-end)
8. 주문상태 = `getOrderStatus(status)` (status 7 또는 8 → 8=취소요청, **7=미매칭 빈셀**)
9. 배송유형 = `getDeliveryType(delivery_type)`

- 상단 "N 개", 20/page, ServerPagination

## 데이터 (legacy)
- `AdminOrder::getOrderCancelRequest($page,$add_where,$orderby,$param)`
- SQL: `select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where (b.status='7' OR b.status='8') <add_where> order by b.order_date desc`
  - **status IN (7,8)** 취소요청, `results_per_page=20`(넘긴 '30' 무시)

## API 계약 (백엔드 전달)

### `GET /admin/order/cancel-request`
목록 조회. 빈값 미전송, search_value 우선 기간무시는 프론트 정규화.

**요청 쿼리**
| 파라미터 | 규칙 |
|----------|------|
| `page` | 기본 1 |
| `search_key`+`search_value` | value 있을 때 동반(settle_no/ordno/product_code/m_id 등호) |
| `search_start_date`/`search_end_date` | 있으면 `a.ord_ymd >= / <=` |

- **백엔드 책임**: `tbl_order a ⋈ tbl_order_item b (settle_no)`, `b.status IN ('7','8')`, `ORDER BY b.order_date DESC`, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "order_date": "2026-07-28 10:03:11",
      "settle_no": "20260728ABC",
      "ordno": "ORD20260728001",
      "m_id": "hong@example.com",
      "product_code": "GOPT12345",
      "product_name": "사이버펑크 2077",
      "is_mobile": "N",
      "price": 49900,
      "status": "8",
      "delivery_type": "1"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 14, "total_pages": 1 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_cancel_request.tsx` → `/order/order_cancel_request` (validateSearch)
- 스크린: `screens/order-cancel-request` (`OrderCancelRequestScreen`)
- entities: `entities/order` 확장 — `OrderCancelRequestItem`/`OrderCancelRequestResponse`/`OrderCancelRequestSearch`, `ORDER_CANCEL_SEARCH_KEY_OPTIONS`(결제번호 first), `resolveOrderCancelRequestSearch`(기본 전체기간), `fetchOrderCancelRequest`/`useOrderCancelRequest`. `getOrderStatusLabel`/`getDeliveryTypeLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`(**`includeAllPeriod` prop 추가** — "전체기간" 프리셋 + emptyLabel="전체기간")·`ServerPagination` 재사용
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/cancel-request`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(search_key 결제번호 first)·9컬럼
- [ ] 필드/검증 일치 — **기본 전체기간**·search_value 기간무시·전체기간 프리셋
- [ ] 분기/플로우 일치 — order_date desc·20/page·번호 ×20·status 8=취소요청/7=빈셀·M뱃지
- [ ] 엣지케이스 일치 — 빈 목록·settle_no 링크 미이관·미매칭 라벨 빈셀
