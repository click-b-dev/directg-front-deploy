# 주문완료 리스트 (order_success)

O1 영역 주문 관리 v2 3번째 화면. status='2'(주문완료) 목록. order_all 확장판(추가 필터 + bg-danger 실동작).

## 원본
- 파일: `pc/_Admin_/order/order_success.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderSuccess()`, `getOrderStatus()`, `getDeliveryType()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, [order-all.md](order-all.md)

## 화면·플로우
- 진입 URL: `/order/order_success.php` → 타겟 `/order/order_success`
- 파라미터(GET): `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label`, `order_system`, `search_is_actv`, `search_delivery_type`, `search_price_min`, `search_price_max`
- breadcrumb: 홈 / 주문 / 주문 관리 / 주문완료 리스트. h4 "주문완료 리스트"

### 검색필터 (card) — order_all 대비 추가
- 검색어: `search_key`(select 4종, order_all 동일) + `search_value`
- 기간검색: daterangepicker(**autoApply:true** — order_all은 false. 우리 공용 위젯 즉시적용과 일치)
- 연동시스템: `order_system` radio — **전체(all)·Asset·Ztorm·Genba·Vaultn·PointNexus** (order_all 대비 **PointNexus 추가**). 값 `none`(연동없음)은 **radio에 없음**(GET 직접 전달만) → 백엔드 `(order_system='' OR order_system IS NULL)` 처리.
- 수령여부: `search_is_actv` radio — 전체("")·수령대기(0)·수령완료(1) **(신규)**
- **숨은 필터(화면 UI 없음, GET 전용)**: `search_delivery_type`(1/2/3), `search_price_min`, `search_price_max` → 백엔드 `delivery_type =`, `price >=`, `price <=`. validateSearch에는 포함(URL 전달 가능), 폼에는 미노출(legacy 동일).

### 검색·기본값 로직 (order_success.php 31~126)
- order_all과 동일: 기본 기간 **오늘~오늘**·라벨 **"오늘"**·order_system 기본 all·search_value 있으면 기간무시(전체기간)·`order_date >= '<start> 00:00:00'`/`<= '<end> 23:59:59'`.
- 추가: order_system=="none"이면 `(order_system='' OR order_system IS NULL)`; is_actv 0/1이면 `is_actv =`; delivery_type 1/2/3이면 `delivery_type =`; price_min/max로 `price >=`/`<=`.
- 정렬 `order_date desc`.

### 목록 (table, 10컬럼) — order_all 대비 **결제상태 컬럼 없음**
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. 주문일자 (order_date)
3. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관)
4. 주문번호 (ordno)
5. 회원아이디 (m_id) + `<br/>(` ip `)` — text-start
6. 상품정보 (product_code + `<br/>` + product_name) — text-start. **M뱃지 죽은 코드**: SQL SELECT에 `is_mobile` 없음 → `$value['is_mobile']` 항상 미존재 → **M뱃지 절대 미표시**(quirk 이식).
7. 주문금액 (price, number_format, text-end)
8. 주문상태 = `getOrderStatus(status)` (status='2' 고정 → 항상 "주문완료")
9. 수령여부 = is_actv=="0" ? 수령대기(badge bg-secondary) : 수령완료(badge bg-success), font-12
10. 배송유형 = `getDeliveryType(delivery_type)`

- 상단 "N 개", 20/page, ServerPagination
- **row 강조 bg-danger 실동작(order_all과 달리 정상 `==` 비교)**: `order_system=="" && (delivery_type=="1" || delivery_type=="3")` → tr + 첫 td에 `bg-danger`. (코드발송 계열인데 연동시스템 없으면 발급누락 의심. 실물 택배(2)는 제외)

## 데이터 (legacy)
- `AdminOrder::getOrderSuccess($page,$add_where,$orderby,$param)`
- SQL: `select settle_no,ordno,m_id,product_code,product_name,price,status,is_actv,delivery_type,order_date,ip,order_system from tbl_order_item where status='2' <add_where> order by order_date desc`
  - **tbl_order_item 단일 테이블**(order_all은 조인), status='2' 고정, `results_per_page=20`. **is_mobile 미SELECT**.

## API 계약 (백엔드 전달)

### `GET /admin/order/success`
목록 조회. 빈값/all 미전송, search_value 우선 기간무시는 프론트 정규화.

**요청 쿼리**
| 파라미터 | 규칙 |
|----------|------|
| `page` | 기본 1 |
| `search_key`+`search_value` | value 있을 때 동반(ordno/settle_no/product_code/m_id 등호) |
| `order_system` | all 아니면 등호. `none`이면 `(order_system='' OR IS NULL)` |
| `search_is_actv` | 0/1이면 `is_actv =` |
| `search_delivery_type` | 1/2/3이면 `delivery_type =` |
| `search_price_min`/`search_price_max` | `price >= / <=` (정수) |
| `search_start_date`/`search_end_date` | `order_date >= '<v> 00:00:00'` / `<= '<v> 23:59:59'` |

- **백엔드 책임**: `tbl_order_item`, `status='2'` 고정, `ORDER BY order_date DESC`, `results_per_page=20`. 응답에 `order_system`(bg-danger 판정·필터 표시용) 포함.

**응답 200**
```json
{
  "items": [
    {
      "order_date": "2026-07-29 10:03:11",
      "settle_no": "20260729ABC",
      "ordno": "ORD20260729001",
      "m_id": "hong@example.com",
      "ip": "1.2.3.4",
      "product_code": "GOPT12345",
      "product_name": "사이버펑크 2077",
      "price": 49900,
      "status": "2",
      "is_actv": "1",
      "delivery_type": "1",
      "order_system": "Asset"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 180, "total_pages": 9 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_success.tsx` → `/order/order_success` (validateSearch — 숨은 필터 포함)
- 스크린: `screens/order-success` (`OrderSuccessScreen`)
- entities: `entities/order` 확장 — `OrderSuccessItem`/`OrderSuccessResponse`/`OrderSuccessSearch`, `ORDER_SUCCESS_SYSTEM_OPTIONS`(PointNexus 포함), `IS_ACTV_OPTIONS`, `resolveOrderSuccessSearch`(기본 오늘~오늘), `fetchOrderSuccess`/`useOrderSuccess`. `ORDER_ALL_SEARCH_KEY_OPTIONS`/`getOrderStatusLabel`/`getDeliveryTypeLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`(emptyLabel="오늘", col-sm-4/col-sm-6)·`ServerPagination` 재사용
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/success`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(연동시스템 6종+PointNexus·수령여부 radio)·10컬럼(결제상태 없음)
- [ ] 필드/검증 일치 — 기본 오늘~오늘·search_value 기간무시·수령여부/연동시스템 필터·숨은 필터(delivery_type/price)
- [ ] 분기/플로우 일치 — order_date desc·20/page·번호 ×20·**bg-danger 실동작**(빈 order_system+코드발송)·M뱃지 죽은 코드 미표시
- [ ] 엣지케이스 일치 — 빈 목록·none 분기(GET)·미매칭 라벨 빈셀·settle_no 링크 미이관
