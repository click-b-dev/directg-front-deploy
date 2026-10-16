# 취소완료 리스트 (order_cancel_complete)

O1 영역 주문 관리 v2 5번째 화면. status='9' 취소완료 목록. order 영역 최다 필터(정렬순서·기간유형·PG·결제수단).

## 원본
- 파일: `pc/_Admin_/order/order_cancel_complete.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderCancelComplete()`, `getOrderStatus()`, `getDeliveryType()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/order_cancel_complete.php` → 타겟 `/order/order_cancel_complete`
- 파라미터(GET): `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `search_pg_provider`, `search_payment_method`, `search_orderby`, `search_date_type`, `date_label`
- breadcrumb: 홈 / 주문 / 주문 관리 / 취소완료 리스트. h4 "취소완료 리스트"

### 검색필터 (card)
- 검색어: `search_key`(select, 결제번호 first — cancel_request와 동일 4종) + `search_value`
- **정렬순서(`search_orderby`) radio**: 취소완료일(내림차순)(`cancel_date`, 기본) / 구매일(내림차순)(`order_date`)
- **기간유형(`search_date_type`) radio**: 취소완료일(`cancel_date`) / 구매일(`order_date`) — 기본 order_date(빈값→else 분기 재설정)
- 기간검색: daterangepicker(**autoApply:false**, 기본 라벨 "이번달")
- 결제 PG(`search_pg_provider`) radio 6종(step1 동일: 전체/KCP/네이버페이/페이코/토스/DGKR)
- 결제수단(`search_payment_method`) radio 10종(step1 동일)

### 검색·기본값 로직 (order_cancel_complete.php 24~112)
1. `page` 없으면 1.
2. **날짜 기본값 quirk**: start 빈값 → **이번달 1일**(`date('Y-m-01')`), end 빈값 → **이번달 말일**(`date('Y-m-t')`). **date_label 기본 "이번달"**.
3. `search_value` 있으면 `search_key`에 따라 `a.settle_no`/`b.ordno`/`b.product_code`/`a.m_id` 등호 + 기간무시(start/end 비움, date_label="전체기간").
4. 없으면: date_label=="전체기간"이면 "". **기간유형**: `search_date_type=="cancel_date"`면 `b.cancel_date >= '<s> 00:00:00'`/`<= '<e> 23:59:59'`, else `a.ord_ymd >= '<s>'`/`<= '<e>'` + search_date_type="order_date" 재설정.
5. `pg_provider`/`payment_method`: all 아니면 등호(빈값이면 all).
6. **정렬**: `search_orderby=="cancel_date"`→`b.cancel_date desc`, `=="order_date"`→`b.order_date desc`, 기타→search_orderby="cancel_date"+`b.cancel_date desc`.

### 목록 (table, 9컬럼)
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. **취소완료일자** = `cancel_date` + `<br/>(` ord_ymd `)` (2줄)
3. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관)
4. 주문번호 (ordno)
5. 회원아이디 (m_id, text-start) — IP 없음
6. 상품정보 (product_code + `<br/>` + is_mobile=Y면 M뱃지 + product_name) — text-start
7. 주문금액 (price, number_format, text-end)
8. 주문상태 = `getOrderStatus(status)` (status='9' 고정 → 항상 "취소완료")
9. 배송유형 = `getDeliveryType(delivery_type)`

- 상단 "N 개", 20/page, ServerPagination

## 데이터 (legacy)
- `AdminOrder::getOrderCancelComplete($page,$add_where,$orderby,$param)`
- SQL: `select * from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where b.status='9' <add_where> order by <orderby>`
  - **status='9'** 취소완료, `results_per_page=20`(넘긴 '30' 무시)

## API 계약 (백엔드 전달)

### `GET /admin/order/cancel-complete`
목록 조회. 빈값/all 미전송, search_value 우선 기간무시는 프론트 정규화.

**요청 쿼리**
| 파라미터 | 규칙 |
|----------|------|
| `page` | 기본 1 |
| `search_key`+`search_value` | value 있을 때 동반(settle_no/ordno/product_code/m_id 등호) |
| `search_orderby` | `cancel_date`(기본) → `b.cancel_date desc`, `order_date` → `b.order_date desc` |
| `search_date_type` | `cancel_date` → cancel_date 기간, `order_date`(기본) → ord_ymd 기간 |
| `search_start_date`/`search_end_date` | date_type에 따라 `cancel_date`(00:00:00~23:59:59) 또는 `ord_ymd` 범위 |
| `search_pg_provider` | all 아니면 `pg_provider =` |
| `search_payment_method` | all 아니면 `payment_method =` |

- **백엔드 책임**: `tbl_order a ⋈ tbl_order_item b (settle_no)`, `b.status='9'`, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "cancel_date": "2026-07-29 11:20:33",
      "ord_ymd": "2026-07-20",
      "settle_no": "20260720ABC",
      "ordno": "ORD20260720001",
      "m_id": "hong@example.com",
      "product_code": "GOPT12345",
      "product_name": "사이버펑크 2077",
      "is_mobile": "N",
      "price": 49900,
      "status": "9",
      "delivery_type": "1"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 30, "total_pages": 2 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_cancel_complete.tsx` → `/order/order_cancel_complete` (validateSearch)
- 스크린: `screens/order-cancel-complete` (`OrderCancelCompleteScreen`)
- entities: `entities/order` 확장 — `OrderCancelCompleteItem`/`OrderCancelCompleteResponse`/`OrderCancelCompleteSearch`, `ORDER_ORDERBY_OPTIONS`, `ORDER_DATE_TYPE_OPTIONS`, `resolveOrderCancelCompleteSearch`(기본 이번달), `fetchOrderCancelComplete`/`useOrderCancelComplete`. `ORDER_CANCEL_SEARCH_KEY_OPTIONS`/`PG_PROVIDER_OPTIONS`/`PAYMENT_METHOD_OPTIONS`/`getOrderStatusLabel`/`getDeliveryTypeLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`(emptyLabel="이번달", col-sm-2/col-sm-3)·`ServerPagination` 재사용
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/cancel-complete`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(정렬순서·기간유형·PG·결제수단)·9컬럼(취소완료일자 2줄)
- [ ] 필드/검증 일치 — 기본 이번달 1일~말일·search_value 기간무시·date_type/orderby 기본값·PG/결제수단 all
- [ ] 분기/플로우 일치 — orderby(cancel_date/order_date) 정렬·date_type별 기간 컬럼·20/page·번호 ×20
- [ ] 엣지케이스 일치 — 빈 목록·status 9 항상 취소완료·M뱃지·settle_no 링크 미이관
