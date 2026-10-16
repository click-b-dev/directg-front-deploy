# PointNexus API - 상품타입 현황

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_product_type.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runProductType()`

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_product_type?mode=prod|test`
- page_title `PointNexus 상품 타입 목록` + h4 `<small>GET /productType</small>` / breadcrumb: 홈 > 상품 > PointNexus 관리 > …
- 환경 셀렉트(`PnModeSelect`, onchange 제출)
- 분기:
  - `error`(success 아님) → `alert-danger` + `pnExtractError`
  - 정상:
    - "전체 **N**개" (`count` 또는 data 길이)
    - **동적 컬럼 테이블**: `data` 모든 원소의 키 합집합을 컬럼으로(순서 유지). 헤더 `#` + 각 키.
    - 각 셀 값 렌더 분기(legacy 순서):
      1. array/object → `<code>` JSON(`JSON_UNESCAPED_UNICODE`)
      2. boolean → `<span class="badge bg-success|bg-secondary">true|false</span>`
      3. GUID 패턴(`^[0-9a-f]{8}-[0-9a-f]{4}-`) → `text-monospace small`
      4. else → 문자열(없으면 빈칸)
    - empty → "표시할 상품 타입이 없습니다." (colspan = 컬럼수+1)
    - `PnJsonBox`(원본 응답)

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/product-types`

- 쿼리: `mode`(prod|test, 기본 prod)
- 백엔드 책임: runProductType 호출, 원본 응답 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: Record<string, unknown>[],  // 가변 스키마
    count?: number,
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_product_type.tsx` → `/goods/pointnexus/pointnexus_product_type` (validateSearch: mode normalize)
- screens: `screens/pointnexus-product-type`
- entities: `pointnexus` 확장 — `PnProductTypeResponse`, `count`(PnResponse에 추가), `collectPnColumns`, `pnCellKind`(헬퍼), 공통 UI `PnCellValue`, `fetchPointNexusProductTypes`/`usePointNexusProductTypes`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/product-types`

## Parity 체크리스트

- [ ] 환경 셀렉트·error 분기
- [ ] 동적 컬럼(키 합집합)·셀 4분기 렌더
- [ ] "전체 N개"·empty 메시지·JSON 박스
- [ ] h4 "GET /productType"
