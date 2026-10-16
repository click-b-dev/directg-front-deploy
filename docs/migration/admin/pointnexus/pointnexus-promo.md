# PointNexus API - 프로모션 현황(캠페인)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_promo.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runPromo()`

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_promo?mode=prod|test`
- page_title `PointNexus 프로모션 캠페인 목록` + h4 `<small>GET /promo</small>`
- inline style `.uuid`/`.table .badge` (파트너와 동일)
- 필터: 환경 셀렉트 `PnModeSelect`(autoSubmit 기본)
- state 색상 맵: running=success, scheduled=info, ended=secondary, paused=warning (그 외 info)
- 분기:
  - `error` → alert-danger + pnExtractError
  - 정상:
    - "전체 **N**개 캠페인"
    - 9컬럼:
      1. #
      2. 캠페인명(name, fw-semibold, 없으면 '—')
      3. 발행자(issuer.name, 없으면 '—')
      4. 상태(state badge 색상맵, 없으면 '—' text-muted)
      5. 상품 수(`productIDs` 길이 + "개")
      6. 시작일(`pn_fmt_date(startDate, 16)` — T→공백, 16자)
      7. 종료일(`pn_fmt_date(endDate, 16)`)
      8. 캠페인 ID(`.uuid`)
      9. 보기 링크(→ `pointnexus_promo_view.php?mode=&id=`, eye)
    - empty → "진행 중인 캠페인이 없습니다." colspan=9
    - `PnJsonBox`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/promos`

- 쿼리: `mode`(prod|test 기본 prod)
- 백엔드 책임: runPromo 호출, 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: { id?, name?, state?, issuer?: { name? }, productIDs?: unknown[], startDate?, endDate? }[],
    count?: number,
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_promo.tsx` → `/goods/pointnexus/pointnexus_promo` (mode normalize)
- screens: `screens/pointnexus-promo`
- entities: `pointnexus` 확장 — `PnCampaign`, `PnPromoResponse`, `pnFmtDate`(helpers), `fetchPointNexusPromos`/`usePointNexusPromos`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/promos`
- 보기 링크(`pointnexus_promo_view`)는 미이관 → `<a href>` 유지

## Parity 체크리스트

- [ ] 환경 셀렉트·error 분기
- [ ] 9컬럼·state 색상·상품 수·날짜 포맷(16자)·uuid
- [ ] "전체 N개 캠페인"·empty·JSON 박스·h4 "GET /promo"
