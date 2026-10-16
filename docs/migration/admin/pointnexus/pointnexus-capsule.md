# PointNexus API - 캡슐 조회

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_capsule.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runCapsule($id)` — 단건 상세 조회

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_capsule?mode=prod|test&id=<hex>`
- page_title `PointNexus 캡슐 조회` + h4 `<small>GET /capsule/{id}</small>`
- inline style: `.uuid`(11px), `.section-title`, `.label-col`(130px), `.json-box`
- 필터: 환경 셀렉트(autoSubmit=false), 캡슐 ID text, "조회" 버튼
- status 색상 맵: init=secondary, running=primary, success=success, failed=danger, cancelled=warning (그 외 info)
- 분기:
  - `id` 없음 → `alert-info` "캡슐 ID(hex)를 입력하세요."
  - `error` → alert-danger + pnExtractError
  - `capsule` 있음(success&&data, 배열이면 [0]):
    - 카드 3종(g-3):
      - **캡슐 정보**: status(badge 색상맵) / poolName(badge, 있으면) / createdAt(`pn_fmt_date`, 있으면) / lastUpdatedAt(있으면) / id(uuid)
      - **플로우**: flowCodename(있으면) / flowVersion(''!=이면) / flowID(uuid, 있으면)
      - **연관 상품**: productID 있으면 uuid 링크(→ product_view)+`상품 상세 조회` 버튼 / 없으면 "연관 상품 정보 없음"
    - **상세 데이터** 카드: metadata/productVariant/productSnapshot 중 **비어있지 않은 것만** json-box `<pre>`
    - **추가 정보** 카드: baseKeys 외 extraKeys 있으면 label/value(scalar 그대로, 아니면 JSON)
    - `PnJsonBox`
  - 그 외(data 없음) → `alert-warning` "데이터 없음"
- baseKeys = id,status,createdAt,lastUpdatedAt,flowID,flowCodename,flowVersion,productID,poolName,metadata,productVariant,productSnapshot

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/capsule`

- 쿼리: `mode`, `id`(hex)
- 백엔드 책임: runCapsule(id) 호출, 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: Record<string, unknown> | Record<string, unknown>[],  // 캡슐 상세(가변 + known 필드)
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_capsule.tsx` → `/goods/pointnexus/pointnexus_capsule` (mode normalize + id)
- screens: `screens/pointnexus-capsule`
- entities: `pointnexus` 확장 — `PnCapsule`(Record), `PnCapsuleResponse`, `fetch/usePointNexusCapsule`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/capsule`
- 링크(product_view)는 미이관 → `<a href>` 유지

## Parity 체크리스트

- [ ] id 없음/error/데이터 없음 분기
- [ ] 카드 3종·조건부 필드·status/poolName badge·uuid·pn_fmt_date
- [ ] 상세 데이터(non-empty만)·추가 정보(extraKeys)·JSON 박스
- [ ] 연관 상품 링크/버튼·h4 "GET /capsule/{id}"
