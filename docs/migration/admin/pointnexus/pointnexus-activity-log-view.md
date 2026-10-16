# PointNexus - 활동 로그 상세 (activity_log_view)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_activity_log_view.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runActivityLogRetrieve($id)` — 단건 상세
- #97(활동 로그 목록)의 보기 링크 대상.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_activity_log_view?mode&id`
- **⚠️ mode 정규화 상이**: 이 화면만 `mode != 'prod'`면 `'test'`(즉 **기본 test**). 다른 화면(normalizePnMode)은 기본 prod. → 라우트에서 `mode === 'prod' ? 'prod' : 'test'`로 재현.
- page_title `PointNexus 활동 로그 상세` + h4 `<small>GET /activitylog/{id}</small>`
- inline style: `.uuid`(11px), `.section-title`, `.label-col`
- 필터: 환경(autoSubmit=false) + 로그 UUID text + 조회
- type 색상: sale=success, cancel=danger, refund=warning, revenue=info, reveal=primary (그 외 secondary)
- 분기: `id` 없음 → alert-info / `error` → alert-danger / `log`(배열이면[0]) → 상세 / 그 외 → alert-warning "데이터 없음"
- 상세:
  - **로그 정보** 카드(col-md-6): id(uuid) / type(badge, 있으면) / createdAt(`pn_fmt_date`, 있으면) / operationID(uuid 링크→operation, 있으면) / fromOperationID(uuid 링크→operation + "원본 오퍼레이션…" 설명, 있으면)
  - **상품(product)** 카드(col-md-6): prod 있으면 prod 객체 키/값 나열(k==='id'면 uuid+product_view 링크, array/object면 JSON, else 문자열) / 없으면 "상품 정보 없음"
  - **추가 정보** 카드(extraKeys): baseKeys(id,type,createdAt,operationID,fromOperationID,product) 외 키. scalar/JSON.
  - `PnJsonBox`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/activity-log-retrieve`

- 쿼리: `mode`, `id`(UUID)
- 백엔드 책임: runActivityLogRetrieve(id), 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: { id, type, createdAt, operationID, fromOperationID, product: Record<string,unknown>, ...extra } | [...],
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_activity_log_view.tsx` → `/goods/pointnexus/pointnexus_activity_log_view` (mode 기본 test + id)
- screens: `screens/pointnexus-activity-log-view`
- entities: `pointnexus` 확장 — `PnActivityLogDetail`(Record)/`PnActivityLogRetrieveResponse`, `fetch/usePointNexusActivityLogRetrieve`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/activity-log-retrieve`
- 링크: operation(#98)·product_view(#104) SPA 경로 · **#97 activity_log_view 링크 활성화**

## Parity 체크리스트

- [ ] mode 기본 test(상이)·id 없음/error/데이터 없음 분기
- [ ] 로그 정보(조건부·operationID/fromOperationID 링크)
- [ ] 상품(동적 키·id 링크)·추가 정보(extraKeys)
- [ ] JSON 박스
