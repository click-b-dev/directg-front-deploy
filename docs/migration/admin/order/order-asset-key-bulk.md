# Asset 주문 일괄조회 (order_asset_key_bulk)

O1 영역 Asset 주문 관리 3번째(마지막) 화면. #209(단건)의 일괄 버전 — textarea에 여러 ordno 입력 → 각 주문 Asset 키 일괄 조회(최대 20건).

## 원본
- 파일: `pc/_Admin_/order/order_asset_key_bulk.php` (라이브)
- 도메인: `tbl_order_item_asset` + `Asset::runReserveAdmin()` (reserve_id별, 관리자 A 권한·비활성 조회)
- 참조: [order-asset-key.md](order-asset-key.md)

## 화면·플로우
- 진입 URL: `/order/order_asset_key_bulk.php` → `/order/order_asset_key_bulk`
- 파라미터: POST `ordnos`(textarea). URL 파라미터 없음.
- page_title "Asset 주문 키 일괄 조회". h4만(breadcrumb 없음). 안내문(줄바꿈·공백·콤마 구분, 관리자 A 비활성, 최대 20건).

### 입력 (card)
- `textarea name=ordnos rows=6 required` + "키 일괄 조회" 버튼(POST)

### 파싱·상한 (order_asset_key_bulk.php 17~41)
- `MAX_ORDNO=20`. `preg_split('/[\s,]+/')` — 줄바꿈/공백/콤마 구분. trim + **중복 제거(입력 순서 유지)**. `input_count`=중복제거 후 개수. 20 초과 시 앞 20건만 + `capped=true`.

### 결과 (searched)
- 요약: 입력 **{input_count}**건 · 키 매칭 주문 **{matched_ordno_count}**건(text-success) · 총 키 **{key_count}**건(text-primary) · capped면 "(상한 초과 — 앞 20건만 조회)"(text-danger)
- 결과 테이블 2컬럼(주문번호 / 키):
  - `found=false`(키 없는 ordno): 주문번호 + `text-danger` "발급된 Asset 키 없음"
  - `found=true`(각 키 행, ordno 반복 가능): 주문번호 + 키(`key !== null`이면 `span.eng`, null이면 `text-danger` "조회 실패")
  - result_rows 빈: colspan=2 "조회 결과가 없습니다."
- 각 ordno: tbl_order_item_asset(asset_id asc) reserve_id별 runReserveAdmin. 키 있으면 found 행들 + matched_ordno_count++, 없으면 found=false 행 1개.

## API 계약 (백엔드 전달)

### `POST /admin/order/asset-key-bulk`
- payload: `{ ordnos: string[] }` (프론트가 파싱·중복제거·20 상한 적용 후 배열 전송. input_count/capped는 프론트가 계산·표시)
- 백엔드: 각 ordno → tbl_order_item_asset(asset_id asc) + reserve_id별 runReserveAdmin. 응답 `{ result_rows, matched_ordno_count, key_count }`.

**응답 200**
```json
{
  "result_rows": [
    { "ordno": "ORD001", "found": true, "key": "AAAAA-BBBBB" },
    { "ordno": "ORD001", "found": true, "key": null },
    { "ordno": "ORD002", "found": false, "key": null }
  ],
  "matched_ordno_count": 1,
  "key_count": 2
}
```
- `found=false`면 키 없음(ordno당 1행). `found=true`면 키 행(ordno당 N행). `key` null이면 조회 실패.

## 타겟 매핑
- 라우트: `src/routes/order/order_asset_key_bulk.tsx` → `/order/order_asset_key_bulk` (URL 파라미터 없음)
- 스크린: `screens/order-asset-key-bulk` (textarea + 파싱 + mutation 조회 + 결과)
- entities: `entities/order` 확장 — `OrderAssetKeyBulkRow`/`OrderAssetKeyBulkResponse`, `fetchOrderAssetKeyBulk`(POST ordnos[])/`useOrderAssetKeyBulk`(mutation). `ORDER_ASSET_KEY_BULK_MAX`=20 상수.
- mock: `shared/mocks/handlers/order.ts` 확장(POST `/admin/order/asset-key-bulk`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — h4·안내문(최대 20)·textarea·요약(입력/매칭/키·capped)·결과 테이블(주문번호/키)
- [ ] 필드/검증 일치 — 줄바꿈/공백/콤마 파싱·중복제거 순서유지·20 상한 capped·found=false 메시지·키 null 조회실패
- [ ] 분기/플로우 일치 — POST 조회·result_rows 빈 메시지·관리자 A 비활성
- [ ] 엣지케이스 일치 — 21건+ 입력 시 앞 20건만·ordno당 키 N행
