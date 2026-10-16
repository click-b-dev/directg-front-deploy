# Genba 주문완료 리스트 (order_genba_success)

O1 영역 Genba 주문 관리 첫 화면. tbl_order_item_genba(Genba API 주문완료) 목록. #208 Asset·#211 Ztorm 주문완료 자매.

## 원본
- 파일: `pc/_Admin_/order/order_genba_success.php` (라이브, 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderGenbaSuccess()` (`src/classes/AdminOrder.php:463`)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`
- 자매: `order_asset_success.php`(#208, search_key select) / `order_ztorm_success.php`(#211, 기본 이번달)

## 화면·플로우
- 진입 URL: `/order/order_genba_success.php` → `/order/order_genba_success`
- 파라미터: `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label`
- breadcrumb: 홈 / 주문 / Genba 주문 관리 / Genba 주문완료. h4 "Genba 주문완료"
- sidebar_order.php: Genba 주문 관리 그룹 중 주문완료

### 검색필터 (card, 한 줄 배치)
- **search_key select**(col-lg-6, form-select col-sm-3): 주문번호(search_ordno)·회원아이디(search_m_id)·옵션상품코드(search_product_code) + search_value input(col-sm-9). **Asset ID 없음, ztorm 3-input 아님**.
- 기간검색(col-lg-6): 라벨 col-sm-2 + reportrange col-sm-4 + input-group col-sm-6 (order_all 레이아웃). 기본 프리셋, **기본 라벨 "이번달"**.
- 제출 버튼 "주문내역 검색"

### 검색·기본값 로직 (legacy 24~70행)
- 기본 기간 **이번달 1일(`Y-m-01`)~말일(`Y-m-t`)** (#211 Ztorm 동일).
- search_value 있으면 search_key switch: search_ordno→`ordno=`, search_product_code→`product_code=`, search_m_id→`m_id=` (등호). 이후 start/end 비움 + `date_label="전체기간"`.
- search_value 없고 label=="전체기간"이면 라벨 초기화. 그 외 `ord_ymd >= / <=`.
- 정렬 `idx desc`. `results_per_page=20`(5번째 인자 '30' 무시 quirk).

### 목록 (table, colgroup 3/8/9/*/17/17/8/4%, thead font-12, td px-1)
1. **번호** = `total_results-(num+(page-1)*20)` 역순(×20)
2. **주문번호<br/>(주문일자)** — ordno + `<br/>(`ord_ymd`)`
3. 회원아이디 (m_id)
4. 상품정보 — product_code + `<br/>` + `<div class='text-wrap'>`product_name`</div>`
5. **Genba 정보** — `[`Sku`]` + `<br/>` + `<div class="text-wrap">`Name`</div>` + `<span class="badge bg-dark ...">`Platform`</span>` + `<span class="badge bg-secondary ...">`Publisher`</span>`
6. **Genba Order ID<br/>Genba Reservation ID** — ID + `<br/>(`ReservationID`)`
7. **발송일자** — `date('Y-m-d H:i:s', strtotime('+9 hours', strtotime(Created)))` (Created UTC→KST +9h)
8. **State** — switch: 0="품절", 1="예약구매", 2="완료" (그 외 빈셀)

- 상단 "N 개", 20/page, ServerPagination
- **row 강조**: State=="0"(품절)이면 `bg-danger`, else `bg-white`
- legacy th `</td>` 오타(State 헤더 208행) → 정상 `</th>` 정규화

## 데이터 (legacy)
- `AdminOrder::getOrderGenbaSuccess($page,$add_where,$orderby,$param)` (5번째 인자 '30' 무시)
- SQL: `select * from tbl_order_item_genba where product_code>0 <add_where> order by idx desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/genba-success`
- 요청: `page`, `search_key`+`search_value`(ordno/m_id/product_code 등호), `search_start_date`/`search_end_date`(ord_ymd 범위)
- 백엔드: `tbl_order_item_genba`, `product_code>0`, `idx desc`, `results_per_page=20`. `Created`(Genba API UTC) → `shipped_at`("Y-m-d H:i:s", **+9h KST**) 포맷.

**응답 200**
```json
{
  "items": [
    {
      "ordno": "ORD2026GB01",
      "ord_ymd": "2026-07-29",
      "m_id": "genbauser@example.com",
      "product_code": "GOPT7001",
      "product_name": "사이버펑크 2077",
      "sku": "GENBA-SKU-001",
      "name": "Cyberpunk 2077 (Genba)",
      "platform": "Steam",
      "publisher": "CD PROJEKT",
      "genba_order_id": "GENBA-ORD-1001",
      "reservation_id": "GENBA-RSV-2001",
      "shipped_at": "2026-07-29 23:33:02",
      "state": "2"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 22, "total_pages": 2 }
}
```

## 타겟 매핑
- 라우트: `src/routes/order/order_genba_success.tsx` → `/order/order_genba_success` (validateSearch)
- 스크린: `screens/order-genba-success`
- entities: `entities/order` 확장 — `OrderGenbaSuccessItem`/`OrderGenbaSuccessResponse`/`OrderGenbaSuccessSearch`, `ORDER_GENBA_SEARCH_KEY_OPTIONS`, `GENBA_STATE_LABEL`, `resolveOrderGenbaSuccessSearch`(기본 이번달 1일~말일), `fetchOrderGenbaSuccess`/`useOrderGenbaSuccess`.
- 공용 UI: `shared/ui/DateRangePicker`(기본 프리셋, emptyLabel="이번달", rangeCol col-sm-4, inputCol col-sm-6)·`ServerPagination`
- mock: `shared/mocks/handlers/order.ts` 확장(`GET /admin/order/genba-success`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(search_key select 3옵션·한 줄)·8컬럼(colgroup 폭·Genba 정보·State)
- [ ] 필드/검증 일치 — 기본 이번달 1일~말일·search_value 기간무시·State 라벨(0/1/2)·State=0 bg-danger·발송일자 +9h
- [ ] 분기/플로우 일치 — idx desc·20/page·번호 ×20·주문번호(주문일자) 2줄
- [ ] 엣지케이스 일치 — 빈 목록·State 미매칭 빈셀·text-wrap 상품명/Name
