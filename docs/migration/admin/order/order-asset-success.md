# Asset 주문완료 리스트 (order_asset_success)

O1 영역 Asset 주문 관리 첫 화면. tbl_order_item_asset(Asset API 주문완료) 목록.

## 원본
- 파일: `pc/_Admin_/order/order_asset_success.php` (라이브)
- 도메인: `AdminOrder::getOrderAssetSuccess()`
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/STOCK-MANAGEMENT.md`

## 화면·플로우
- 진입 URL: `/order/order_asset_success.php` → `/order/order_asset_success`
- 파라미터: `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label`
- breadcrumb: 홈 / 주문 / Asset 주문 관리 / Asset 주문완료. h4 "Asset 주문완료"

### 검색필터 (card)
- 검색어: `search_key`(select) + `search_value`. 옵션: 주문번호(search_ordno)·회원아이디(search_m_id)·**Asset ID(search_asset_id)**·옵션상품코드(search_product_code). 결제번호 없음.
- 기간검색: daterangepicker(기본 프리셋 세트, autoApply:false, 기본 라벨 "오늘")

### 검색·기본값 로직
- 기본 기간 **오늘~오늘**(order_all과 동일), search_value 있으면 search_key별 등호(ordno/asset_id/m_id/product_code) + 기간무시(전체기간). 없으면 `ord_ymd >= / <=`.
- 정렬 `idx desc`.

### 목록 (table, 8컬럼)
1. **번호** = `total_results-(idx+(page-1)*20)` 역순
2. 주문일자 (order_date)
3. 주문번호 (ordno)
4. 회원아이디 (m_id `<br/>(`m_no`)`)
5. 상품정보 (product_code + `<br/>` + product_name `div.text-wrap width:25rem`)
6. **Asset 정보** (`[`asset_id`]` + `<br/>` + asset_name div.text-wrap 25rem + `<span class="badge bg-dark ...">`asset_type`</span>` + `<span class="badge bg-secondary ...">`asset_publisher`</span>`)
7. **Reseve ID** (reserve_id) — 헤더 오타 "Reseve" 유지
8. 상세보기 (빈 셀, legacy th `</td>` 오타는 정상 th로 정규화)

- 상단 "N 개", 20/page, ServerPagination
- **row 강조**: asset_type=="임시코드"면 `bg-danger`, else `bg-white`

## 데이터 (legacy)
- `AdminOrder::getOrderAssetSuccess($page,$add_where,$orderby,$param)`
- SQL: `select * from tbl_order_item_asset where asset_id>'0' <add_where> order by idx desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/asset-success`
- 요청: `page`, `search_key`+`search_value`(ordno/asset_id/m_id/product_code 등호), `search_start_date`/`search_end_date`
- 백엔드: `tbl_order_item_asset`, `asset_id>'0'`, `idx desc`, `results_per_page=20`.

**응답 200**
```json
{
  "items": [
    {
      "order_date": "2026-07-29 10:03:11",
      "ordno": "ORD20260729001",
      "m_id": "hong@example.com",
      "m_no": "100231",
      "product_code": "GOPT12345",
      "product_name": "사이버펑크 2077",
      "asset_id": "5001",
      "asset_name": "Cyberpunk 2077 Steam Key",
      "asset_type": "정식코드",
      "asset_publisher": "CD PROJEKT",
      "reserve_id": "RSV-2026-0001"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 30, "total_pages": 2 }
}
```

## 타겟 매핑
- 라우트: `src/routes/order/order_asset_success.tsx` → `/order/order_asset_success` (validateSearch)
- 스크린: `screens/order-asset-success`
- entities: `entities/order` 확장 — `OrderAssetSuccessItem`/`OrderAssetSuccessResponse`/`OrderAssetSuccessSearch`, `ORDER_ASSET_SEARCH_KEY_OPTIONS`, `resolveOrderAssetSuccessSearch`(기본 오늘~오늘), `fetchOrderAssetSuccess`/`useOrderAssetSuccess`.
- 공용 UI: `shared/ui/DateRangePicker`(기본 프리셋, emptyLabel="오늘")·`ServerPagination`
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/asset-success`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(Asset ID 옵션)·8컬럼(Asset 정보·Reseve ID 오타·상세보기 빈셀)
- [ ] 필드/검증 일치 — 기본 오늘~오늘·search_value 기간무시·asset_type 뱃지·bg-danger(임시코드)
- [ ] 분기/플로우 일치 — idx desc·20/page·번호 ×20
- [ ] 엣지케이스 일치 — 빈 목록·m_id/m_no·text-wrap 25rem
