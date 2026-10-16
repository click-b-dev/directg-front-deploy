# Vaultn 주문완료 리스트 (order_vaultn_success)

O1 영역 Vaultn 주문 관리 첫 화면. tbl_order_item_vaultn(Vaultn API 주문완료) 목록. #211 Ztorm 주문완료 자매(2 input).

## 원본
- 파일: `pc/_Admin_/order/order_vaultn_success.php` (라이브, 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderVaultnSuccess()` (`src/classes/AdminOrder.php:483`)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/order_vaultn_success.php` → `/order/order_vaultn_success`
- 파라미터: `page`, `search_ordno`, `search_m_id`, `search_start_date`, `search_end_date`, `date_label`
- breadcrumb: 홈 / 주문 / **Genba 주문 관리**(legacy copy-paste 버그, Vaultn 아님 — 그대로 이식) / Vaultn 주문완료. h4 "Vaultn 주문완료"
- sidebar_order.php: Vaultn 주문 관리 그룹 중 주문완료

### 검색필터 (card)
- **개별 input 2종**: 주문번호 `search_ordno`(col-lg-3, 라벨 col-sm-4/input col-sm-8) + 회원아이디 `search_m_id` placeholder "회원아이디(이메일)"(col-lg-4, 라벨 col-sm-3/input col-sm-9). **search_key select 아님, ztorm 3-input도 아님**.
- 기간검색: daterangepicker(기본 프리셋, autoApply:false, **기본 라벨 "이번달"**). 라벨 col-sm-1 + reportrange col-sm-2 + input-group col-sm-4 (#211 Ztorm 동일 레이아웃).
- 제출 버튼 "**Asset 주문 검색**"(legacy copy-paste 버그 — Vaultn 아님, 그대로 이식)

### 검색·기본값 로직 (legacy 24~67행)
- 기본 기간 **이번달 1일(`Y-m-01`)~말일(`Y-m-t`)**.
- `search_ordno`→`clientOrderReference='...'`(주의: ordno 아님), `search_m_id`→`m_id='...'` (등호).
- 2 키워드 중 하나라도 있으면 기간무시 → start/end 비움, `date_label="전체기간"`. 없고 label=="전체기간"이면 초기화. 그 외 `ord_ymd >= / <=`.
- 정렬 **`reg_date desc`**(#211/#213의 idx desc와 다름). `results_per_page=20`(5번째 인자 '30' 무시 quirk).

### 목록 (table, thead font-13)
1. **번호** = `total_results-(num+(page-1)*20)` 역순(×20)
2. **주문번호<br/>(주문일자)** — clientOrderReference + `<br/>(`ord_ymd`)`
3. 회원아이디 (m_id) — text-center 없음(기본 좌측)
4. 상품정보 — product_code + `<br/>` + `<div class='text-wrap' style="width:25rem">`product_name`</div>`
5. **Vaultn 정보** — `[`sku`]` + `<br/>` + `<div class="text-wrap" style="width:25rem">`Name`</div>` + `<span class="badge bg-dark ...">`provider`</span>` + `<span class="badge bg-secondary ...">`publisherName`</span>`
6. **Vaultn Order ID<br/>(발송일자)** — orderId + `<br/>(`reg_date`)` (td px-1)
7. **State** — status **raw 값**(라벨 매핑 없음)
8. **키확인** — `<button type="button" class="btn btn-sm btn-info shadow-none" data-id="...">키확인</button>` (legacy 클릭 핸들러 없음 → **inert 버튼**)

- 상단 "N 개", 20/page, ServerPagination
- **row 강조 없음**(평범한 `<tr>`)
- legacy th `</td>` 오타(State·키확인 헤더 200·201행) → 정상 `</th>` 정규화
- dead: `$checked['search_pg_provider']`/`['search_payment_method']`(97·98행) 미참조 죽은 코드, 미이식

## 데이터 (legacy)
- `AdminOrder::getOrderVaultnSuccess($page,$add_where,$orderby,$param)` (5번째 인자 '30' 무시)
- SQL: `select * from tbl_order_item_vaultn where product_code>0 <add_where> order by reg_date desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/vaultn-success`
- 요청: `page`, `search_ordno`(clientOrderReference 등호)/`search_m_id`(등호, 우선 시 기간무시), `search_start_date`/`search_end_date`(ord_ymd 범위)
- 백엔드: `tbl_order_item_vaultn`, `product_code>0`, **`reg_date desc`**, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "client_order_reference": "ORD2026VN01",
      "ord_ymd": "2026-07-29",
      "m_id": "vaultnuser@example.com",
      "product_code": "GOPT7001",
      "product_name": "사이버펑크 2077",
      "sku": "VAULTN-SKU-001",
      "name": "Cyberpunk 2077 (Vaultn)",
      "provider": "Steam",
      "publisher_name": "CD PROJEKT",
      "order_id": "VAULTN-ORD-1001",
      "reg_date": "2026-07-29 23:33:02",
      "status": "Completed"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 22, "total_pages": 2 }
}
```

## 타겟 매핑
- 라우트: `src/routes/order/order_vaultn_success.tsx` → `/order/order_vaultn_success` (validateSearch)
- 스크린: `screens/order-vaultn-success`
- entities: `entities/order` 확장 — `OrderVaultnSuccessItem`/`OrderVaultnSuccessResponse`/`OrderVaultnSuccessSearch`, `resolveOrderVaultnSuccessSearch`(기본 이번달 1일~말일), `fetchOrderVaultnSuccess`/`useOrderVaultnSuccess`.
- 공용 UI: `shared/ui/DateRangePicker`(기본 프리셋, emptyLabel="이번달", 기본 rangeCol/inputCol)·`ServerPagination`
- mock: `shared/mocks/handlers/order.ts` 확장(`GET /admin/order/vaultn-success`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb(Genba 버그)·h4·검색필터(2 input·버튼 "Asset 주문 검색" 버그)·8컬럼(Vaultn 정보·State raw·키확인 버튼)
- [ ] 필드/검증 일치 — 기본 이번달 1일~말일·2 키워드 등호+기간무시·provider/publisherName 뱃지·row 강조 없음·State raw
- [ ] 분기/플로우 일치 — **reg_date desc**·20/page·번호 ×20·키확인 inert·주문번호(주문일자) 2줄·Vaultn Order ID(발송일자) 2줄
- [ ] 엣지케이스 일치 — 빈 목록·m_id 단일·text-wrap 25rem·93일/역순 alert
