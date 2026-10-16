# 주문통합 리스트 (order_all)

O1 영역 주문 관리 v2 첫 화면. tbl_order_item 레벨(주문 아이템별) 통합 목록.

## 원본
- 파일: `pc/_Admin_/order/order_all.php` (라이브 — 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderAll()`, `getCheckoutStatus()`, `getOrderStatus()`, `getDeliveryType()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/order_all.php` → 타겟 `/order/order_all`
- 파라미터(GET): `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label`, `order_system`
- breadcrumb: 홈 / 주문 / 주문 관리 / 주문통합 리스트. h4 "주문통합 리스트"

### 검색필터 (card)
- 검색어: `search_key`(select) + `search_value`(text). select 옵션 순서: 주문번호(`search_ordno`)·결제번호(`search_settle_no`)·회원아이디(`search_m_id`)·옵션상품코드(`search_product_code`). 기본 선택 첫 옵션(search_ordno).
- 기간검색: daterangepicker. **daterangepicker JS는 `autoApply:false`(step1/2/vbank는 true)** — 우리 공용 위젯은 프리셋 즉시 적용 방식이라 미세 UX 차이(결과 동일, 문서화).
- 연동시스템: `order_system`(radio) — 전체(all)·Asset·Ztorm·Genba·Vaultn

### 검색·기본값 로직 (order_all.php 21~95)
1. `page` 없으면 1. `order_system` 빈값이면 `all`.
2. **날짜 기본값 quirk**: `search_start_date`/`search_end_date` 빈값이면 각각 **오늘**(`date('Y-m-d')`) — step1은 -2day·vbank는 -1month. **date_label 기본 표시 "오늘"**(JS `else` 분기; step1/2/vbank는 "선택").
3. `order_system != all` → `b.order_system = '<값>'`.
4. `search_value` 있으면 `search_key`에 따라 `b.settle_no`/`b.ordno`/`b.product_code`/`b.m_id` 등호 + **기간무시**(start/end 비움, date_label="전체기간"). switch에 없는 key여도 기간무시.
5. 아니면: date_label=="전체기간"이면 "" 초기화. `b.order_date >= '<start> 00:00:00'`, `<= '<end> 23:59:59'` (order_date 기준, 시분초 부여).
6. 정렬 `b.order_date desc`.

### 목록 (table, 11컬럼)
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. 주문일자 (order_date)
3. 결제번호 (settle_no) → `order_view.php?settle_no=` 링크(미이관)
4. 결제상태 = `getCheckoutStatus(step)`
5. 주문번호 (ordno)
6. 회원아이디 (m_id) + `<br/>(` ip `)` — text-start
7. 상품정보 (product_code + `<br/>` + is_mobile=Y면 M뱃지 + product_name) — text-start
8. 주문금액 (price, number_format, text-end)
9. 주문상태 = `getOrderStatus(status)`
10. 수령여부 = is_actv=="0" ? `수령대기`(badge bg-secondary) : `수령완료`(badge bg-success), font-12
11. 배송유형 = `getDeliveryType(delivery_type)`

- 상단 "N 개", 20/page, ServerPagination
- **row 강조 죽은 코드**: `if($value['order_system']="")` — `==`가 아닌 **`=` 대입 버그** → 항상 "" 대입(falsy)해 else 분기, `bg-danger`가 **절대 적용 안 됨**. → 구현에서 bg-danger 미적용(quirk 이식).

### 라벨 맵
- `getCheckoutStatus`(재사용): 1입금대기/2결제완료/8환불요청/9환불완료/99취소완료
- `getOrderStatus`(신규, 미매칭 빈셀): 1주문대기/2주문완료/3배송준비/4배송중/5배송완료/6구매확정/8취소요청/9취소완료
- `getDeliveryType`(신규, 미매칭 빈셀): 1코드발송/2택배발송/3코드 + 택배발송

## 데이터 (legacy)
- `AdminOrder::getOrderAll($page,$add_where,$orderby,$param)`
- SQL: `select b.*, a.step from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.m_no>'0' <add_where> order by b.order_date desc`
- `results_per_page=20`(넘긴 '20'과 일치)

## API 계약 (백엔드 전달)

### `GET /admin/order/all`
목록 조회. 빈값/all 미전송, search_value 우선 기간무시는 프론트 정규화 완료.

**요청 쿼리**
| 파라미터 | 규칙 |
|----------|------|
| `page` | 기본 1 |
| `search_key` | search_value 있을 때 동반 전송(search_ordno/settle_no/product_code/m_id → 등호 대상 컬럼) |
| `search_value` | 검색어 |
| `order_system` | all 아니면 `b.order_system =` 등호 (Asset/Ztorm/Genba/Vaultn) |
| `search_start_date` | 있으면 `b.order_date >= '<v> 00:00:00'` |
| `search_end_date` | 있으면 `b.order_date <= '<v> 23:59:59'` |

- **백엔드 책임**: `tbl_order a ⋈ tbl_order_item b (settle_no)`, `a.m_no>0`, `ORDER BY b.order_date DESC`, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "order_date": "2026-07-29 10:03:11",
      "settle_no": "20260729ABC",
      "step": "2",
      "ordno": "ORD20260729001",
      "m_id": "hong@example.com",
      "ip": "1.2.3.4",
      "product_code": "GOPT12345",
      "product_name": "사이버펑크 2077",
      "is_mobile": "N",
      "price": 49900,
      "status": "2",
      "is_actv": "1",
      "delivery_type": "1",
      "order_system": "Asset"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 240, "total_pages": 12 }
}
```
- 에러: 서버 오류 시 500(legacy die).

## 타겟 매핑
- 라우트: `src/routes/order/order_all.tsx` → `/order/order_all` (validateSearch)
- 스크린: `screens/order-all` (`OrderAllScreen`)
- entities: `entities/order` 확장 — `OrderAllItem`/`OrderAllResponse`/`OrderAllSearch`, `ORDER_STATUS_LABEL`/`getOrderStatusLabel`, `DELIVERY_TYPE_LABEL`/`getDeliveryTypeLabel`, `ORDER_ALL_SEARCH_KEY_OPTIONS`, `ORDER_SYSTEM_OPTIONS`, `resolveOrderAllSearch`(기본 오늘~오늘), `fetchOrderAll`/`useOrderAll`. `getCheckoutStatusLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`(`emptyLabel`="오늘" + `rangeColClassName`="col-sm-4"/`inputColClassName`="col-sm-6"으로 legacy 그리드 label col-sm-2 + reportrange col-sm-4 + inputs col-sm-6 재현)·`ServerPagination` 재사용
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/all`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(search_key select·연동시스템 radio)·11컬럼
- [ ] 필드/검증 일치 — 기본 오늘~오늘·라벨 "오늘"·search_value 기간무시·order_date 00:00:00~23:59:59
- [ ] 분기/플로우 일치 — order_date desc·20/page·번호 ×20·bg-danger 죽은 코드 미적용·수령여부 뱃지
- [ ] 엣지케이스 일치 — 빈 목록·미매칭 라벨 빈셀·M뱃지·settle_no 링크 미이관
