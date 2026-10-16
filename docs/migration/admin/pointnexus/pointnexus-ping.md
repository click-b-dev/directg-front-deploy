# PointNexus API - 연결확인(인증 상태)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_ping.php` (라이브), 공통 헬퍼 `pointnexus/_inc.php`
- 데이터: `PointNexus($mode)->runTest()`
- **신규 도메인(PointNexus)** — `entities/pointnexus` 신설(그룹 공통 인프라 포함).

## 공통 헬퍼(_inc.php) → 타겟 매핑 (그룹 전체 재사용)

- `pn_normalize_mode($mode)`: `'prod'|'test'`만 유지, 그 외/미지정 → **'prod'** 기본 → `normalizePnMode()`
- `pn_mode_select($mode, $auto_submit)`: 환경 셀렉트(Sandbox(test)/Production(prod)), onchange 자동 제출 → `PnModeSelect`
- `pn_extract_error($result)`: `result.errors[0].message` 또는 기본 'API 오류가 발생했습니다.' → `pnExtractError()`
- `pn_json_box($data)`: `<details>` 접이식 원본 JSON 박스 → `PnJsonBox`
- (그 외 pn_get_lang/pn_fmt_date/pn_fmt_price/pn_filter_currencies/pn_pagination_* 는 후속 화면에서 이관 시 도입)

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_ping?mode=prod|test`
- page_title `PointNexus 인증 상태 확인` + h4 우측 `<small>GET /test</small>` / breadcrumb: 홈 > 상품 > PointNexus 관리 > PointNexus 인증 상태 확인
- 환경 필터 카드: `PnModeSelect`(onchange 자동 제출 → mode 재조회)
- 결과 분기 (`runTest()`):
  - `success && data` → data[0](배열이면) 또는 data:
    - 카드1 환경: `isSandbox`면 SANDBOX 배지(경고/flask 아이콘), 아니면 PRODUCTION 배지(위험/rocket 아이콘)
    - 카드2 인증된 Provider: name / persona(badge) / id (없으면 "정보 없음")
    - 카드3 API 자격증명: name / clientID (없으면 "정보 없음")
    - 성공 alert "토큰이 정상적으로 인증되었습니다."
    - `PnJsonBox`(원본 응답 JSON)
  - 그 외 → `alert alert-danger`에 `pnExtractError` 메시지

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/ping`

- 쿼리: `mode`(prod|test, 기본 prod)
- 백엔드 책임: 해당 mode로 PointNexus runTest 호출, 원본 응답 반환.
- 응답 `200` (runTest 원본):
  ```
  { success: boolean,
    data?: PnTestData | PnTestData[],   // PnTestData: { isSandbox, authenticatedProvider?{name,persona,id}, credentials?{name,clientID} }
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_ping.tsx` → `/goods/pointnexus/pointnexus_ping` (validateSearch: mode normalize)
- screens: `screens/pointnexus-ping`
- entities: **신규 `pointnexus`** — types(`PnMode`, `PnTestData`, `PnTestResponse`), `normalizePnMode`/`pnExtractError`, `fetchPointNexusPing`/`usePointNexusPing`, 공통 UI `PnModeSelect`/`PnJsonBox`
- mock: **신규 `handlers/pointnexus.ts`**(handlers.ts 등록) — `GET /admin/pointnexus/ping`

## Parity 체크리스트

- [ ] 환경 셀렉트(test/prod, onchange 제출)·기본 prod
- [ ] 성공 시 카드 3종(환경/Provider/자격증명)·성공 alert·JSON 박스
- [ ] 에러 시 alert-danger + pnExtractError
- [ ] h4 "GET /test" small
