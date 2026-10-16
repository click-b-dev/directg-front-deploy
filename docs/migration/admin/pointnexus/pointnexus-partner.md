# PointNexus API - 파트너 현황

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_partner.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runPartner($persona)`

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_partner?mode=prod|test&persona=`
- page_title `PointNexus 파트너 목록` + h4 `<small>GET /partner</small>` / breadcrumb: 홈 > 상품 > PointNexus 관리 > …
- inline `<style>`: `.uuid`(monospace 12px #6c757d break-all), `.table .badge`(12px, 500)
- 필터(method=get):
  - 환경 셀렉트 `PnModeSelect`(**autoSubmit=false** — pn_mode_select($mode, false))
  - persona 셀렉트(onchange 자동 제출): (전체)='' / publisher / manufacturer / distributor / store / influencer / platform / trader
  - "검색" 버튼(mode 반영 제출)
- persona 색상 맵: publisher=primary, manufacturer=success, distributor=info, store=warning, influencer=danger, platform=secondary, trader=dark (그 외 secondary)
- 분기:
  - `error` → alert-danger + pnExtractError
  - 정상:
    - "전체 **N**개 파트너" + persona 있으면 ` (persona: X)`
    - 테이블 7컬럼:
      1. # (i+1)
      2. 이름(name, fw-semibold, 없으면 '—')
      3. persona(badge 색상맵, 없으면 '—')
      4. useAPI(badge success 'true' / secondary 'false')
      5. 계약 수(`contracts` 길이 + "개")
      6. 파트너 ID(`.uuid`)
      7. 보기 링크(→ `pointnexus_partner_view.php?mode=&partnerID=`, eye 아이콘)
    - empty → "파트너가 없습니다." colspan=7
    - `PnJsonBox`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/partners`

- 쿼리: `mode`(prod|test 기본 prod), `persona`(빈값=전체)
- 백엔드 책임: runPartner(persona) 호출, 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: { id?, name?, persona?, useAPI?: boolean, contracts?: unknown[] }[],
    count?: number,
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_partner.tsx` → `/goods/pointnexus/pointnexus_partner` (validateSearch: mode normalize + persona)
- screens: `screens/pointnexus-partner`
- entities: `pointnexus` 확장 — `PnPartner`, `PnPartnerResponse`, `fetchPointNexusPartners`/`usePointNexusPartners`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/partners`
- 보기 링크(`pointnexus_partner_view`)는 미이관 → `<a href>` 유지(후속)

## Parity 체크리스트

- [ ] 환경(autoSubmit=false)+persona(onchange 제출)+검색 버튼
- [ ] persona 색상 맵·useAPI badge·계약 수·uuid 스타일
- [ ] "전체 N개 파트너 (persona: X)"·empty·JSON 박스
- [ ] 보기 링크(mode/partnerID 전달)
