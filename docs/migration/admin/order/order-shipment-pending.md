# 배송대기 리스트 (order_shipment_pending)

O1 영역 배송 주문 관리 v2 2번째 화면. shipment_status='2'(배송대기) 고정. #202(all)와 자매지만 배송상태 radio 없음·엑셀버튼 활성·배송상태 컬럼 상이.

## 원본
- 파일: `pc/_Admin_/order/order_shipment_pending.php` (라이브)
- 도메인: `AdminOrder::getOrderShipmentPending()`, `getOrderStatus()`
- 참조: `docs/legacy-admin/40-order.md`, [order-shipment-all.md](order-shipment-all.md)

## #202(order_shipment_all) 대비 차이
1. page_title/breadcrumb "배송대기 리스트"
2. **배송상태 radio 없음** (shipment_status='2' 고정)
3. 도메인 `getOrderShipmentPending` — SQL에 `c.shipment_status='2'` 추가 고정
4. daterangepicker **기본 프리셋 세트**(선택/오늘/어제/지난 7일/지난 30일/이번달/지난달/직접선택 — 지난해 없음, 지난 30일·이번달 있음)
5. **엑셀다운로드 버튼 활성**(all은 주석): `<button class="btn btn-danger js-excel-download">엑셀다운로드</button> (다운로드 된 주문은 배송준비 리스트로 이동됩니다)`
6. 배송상태 컬럼(10번째) = **`send_status` raw**(all은 shipment_status 라벨). 라벨 변환 없음

### 엑셀다운로드 (legacy quirk)
- `js-excel-download` 클릭 → `order_excel_export.php` POST(target=ifrmProcess), `mode=sales_excel_download`, `excel_name=order_list`, `data=encodeURI($('#excelData').html())`.
- **`#excelData` 요소가 페이지에 없음** → `data` 빈값(불완전). target iframe `ifrmProcess`도 없음. legacy 불완전 코드지만 버튼은 노출 → 버튼+안내문구 이식, 클릭은 백엔드 엑셀 엔드포인트 POST(백엔드 책임, MSW mock 불가).

## 화면·플로우
- 진입 URL: `/order/order_shipment_pending.php` → 타겟 `/order/order_shipment_pending`
- 파라미터(GET): `page`, `search_key`, `search_value`, `search_start_date`, `search_end_date`, `date_label` (**shipment_status 없음**)
- 검색·기본값 로직: #202와 동일(기본 지난달 1일~이번달 말일, search_value 우선 기간무시, a.ord_ymd 범위)
- 정렬 `order_item_id desc`

### 목록 (table, 11컬럼) — #202와 동일 골격, 배송상태 컬럼만 send_status raw
번호(역순 ×20)/주문일자/결제번호(order_view 미이관)/주문번호/회원아이디/상품코드/상품명(M뱃지)/주문금액/주문상태(getOrderStatus)/**배송상태(send_status raw)**/수령여부(is_actv O·X)

## 데이터 (legacy)
- `AdminOrder::getOrderShipmentPending($page,$add_where,$orderby,$param)`
- SQL: `... where a.step='2' and b.status='2' and c.shipment_status='2' and b.delivery_type<>'1' <add_where> order by order_item_id desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/shipment-pending`
- 요청: `page`, `search_key`+`search_value`, `search_start_date`/`search_end_date` (배송상태 필터 없음)
- 백엔드: 3중 조인 + `c.shipment_status='2'` 고정, `order_item_id desc`, `results_per_page=20`. 응답 item에 `send_status` 포함(배송상태 컬럼용).

### `POST /admin/order/excel-export` (엑셀다운로드)
- `mode=sales_excel_download`, `excel_name=order_list` POST → 백엔드 CSV. legacy `#excelData` 부재로 `data` 빈값(quirk). MSW mock 불가.

**응답 200**: #202와 동일 구조 + `send_status` 필드.

## 타겟 매핑
- 라우트: `src/routes/order/order_shipment_pending.tsx` → `/order/order_shipment_pending`
- 스크린: `screens/order-shipment-pending`
- entities: `entities/order` 확장 — `OrderShipmentItem`에 `send_status` 추가, `OrderShipmentFixedSearch`(고정상태 배송화면 공용: shipment_status radio 없는 검색), `resolveOrderShipmentFixedSearch`(기본 지난달~이번달말일), `fetchOrderShipmentPending`/`useOrderShipmentPending`. `ORDER_CANCEL_SEARCH_KEY_OPTIONS`/`getOrderStatusLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`(기본 프리셋 세트, presetKeys 생략)·`ServerPagination`
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/shipment-pending`, shipment rows에 send_status 추가)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(배송상태 radio 없음)·엑셀버튼+안내·11컬럼
- [ ] 필드/검증 일치 — 기본 지난달~이번달말일·기본 프리셋 세트·배송상태 send_status raw
- [ ] 분기/플로우 일치 — shipment_status=2 고정·order_item_id desc·20/page·번호 ×20
- [ ] 엣지케이스 일치 — 빈 목록·M뱃지·엑셀 #excelData 부재 quirk·settle_no 링크 미이관
