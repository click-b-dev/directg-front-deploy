# Asset 주문조회 (order_asset_key)

O1 영역 Asset 주문 관리 2번째 화면. **단건 조회**: 주문번호(ordno)로 Asset 키 조회(관리자 A 권한, 활성화 없이). 목록/페이지네이션 없음.

## 원본
- 파일: `pc/_Admin_/order/order_asset_key.php` (라이브)
- 도메인: `tbl_order_item`(주문 요약) + `tbl_order_item_asset`(키 기록) + `Asset::runReserveAdmin()`(Asset 3.3 API, reserve_id별 실제 키)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/STOCK-MANAGEMENT.md`

## 화면·플로우
- 진입 URL: `/order/order_asset_key.php?ordno=` → 타겟 `/order/order_asset_key`
- 파라미터(GET): `ordno`(required)
- page_title "Asset 주문 키 조회". breadcrumb 없음(h4만). 안내문 "주문번호(ordno)로 ... 관리자(A) 권한 조회라 **키가 활성화되지 않습니다.**"

### 검색 (card)
- input-group: "주문번호(ordno)" 라벨 + `ordno` text(required) + "키 조회" 버튼. GET 제출.

### 결과 (ordno 있을 때만, searched)
- **주문 항목 없음**(order_info null): `alert-warning` "해당 주문번호(ordno = <b>{ordno}</b>)의 주문 항목이 없습니다."
- **주문 정보 카드**(order_info): 표 3행 — 주문번호/결제번호 · 구매자ID(m_id)/활성화여부(is_actv 1=활성화 badge success·else 미활성 badge secondary) · 상품(product_name (product_code), colspan)
- **Asset 키 카드**: 헤더 "Asset 키" + `{N} 건` 뱃지. 테이블 7컬럼(상품/Asset ID/공급처/Reserve ID/키/활성화/PO)
  - 키 없음(key_rows 빈): colspan=7 "이 주문에는 발급된 Asset 키가 없습니다. (다른 키발급 시스템이거나 미발급)"
  - 키: `key !== null`이면 `span.eng.fw-bold.user-select-all`, null이면 `text-danger "조회 실패"`
  - 활성화: `activated===true` → badge success + `activatedDt`(num font-11) / `false` → badge secondary "미활성" / else "-"
  - PO: `span.eng.font-11`

## 데이터 (legacy)
- 주문 요약: `select ordno,settle_no,product_code,product_name,status,is_actv,order_system,m_id from tbl_order_item where ordno=:ordno`
- 키 기록: `select reserve_id,asset_id,asset_name,product_name,asset_type,asset_publisher from tbl_order_item_asset where ordno=:ordno order by asset_id asc`
- 각 reserve_id(빈값 skip) → `Asset::runReserveAdmin(reserve_id)` (Asset 3.3, 활성화 없이 키 조회) → key/activated/activatedDt/po

## API 계약 (백엔드 전달)

### `GET /admin/order/asset-key?ordno=`
- 요청: `ordno`(필수). ordno 없으면 프론트에서 미조회.
- 백엔드: tbl_order_item 주문 요약 + tbl_order_item_asset 키 기록(asset_id asc) + reserve_id별 runReserveAdmin(Asset 3.3, 활성화 없이). 페이지네이션 없음.

**응답 200**
```json
{
  "order_info": {
    "ordno": "ORD20260729001",
    "settle_no": "20260729ABC",
    "product_code": "GOPT12345",
    "product_name": "사이버펑크 2077",
    "status": "2",
    "is_actv": "0",
    "order_system": "Asset",
    "m_id": "hong@example.com"
  },
  "key_rows": [
    {
      "product": "사이버펑크 2077",
      "asset_id": "5001",
      "publisher": "CD PROJEKT",
      "reserve_id": "RSV-2026-0001",
      "key": "XXXXX-YYYYY-ZZZZZ",
      "activated": false,
      "activatedDt": "",
      "po": "PO-2026-01"
    }
  ]
}
```
- `order_info`가 null이면 주문 항목 없음(경고). `key` null이면 조회 실패. `activated` true/false/null.

## 타겟 매핑
- 라우트: `src/routes/order/order_asset_key.tsx` → `/order/order_asset_key` (validateSearch {ordno})
- 스크린: `screens/order-asset-key` (검색폼 + 조건부 결과)
- entities: `entities/order` 확장 — `OrderAssetKeyOrderInfo`/`OrderAssetKeyRow`/`OrderAssetKeyResponse`, `fetchOrderAssetKey`/`useOrderAssetKey`(enabled=ordno≠"").
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/asset-key`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — h4·안내문·검색폼(ordno required)·주문 정보 카드·Asset 키 카드(7컬럼·N건)
- [ ] 필드/검증 일치 — 미조회(ordno 없음)·주문없음 경고·키 null 조회실패·활성화 3분기·PO
- [ ] 분기/플로우 일치 — 단건 조회(페이지네이션 없음)·asset_id asc·활성화 안 됨(관리자 A)
- [ ] 엣지케이스 일치 — 키 0건 메시지·activatedDt·user-select-all
