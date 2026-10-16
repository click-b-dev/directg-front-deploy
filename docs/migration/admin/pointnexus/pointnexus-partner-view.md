# PointNexus - 파트너 상세 (partner_view)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_partner_view.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runPartnerRetrieve($partnerID)` — 단건 상세
- #93(파트너 목록)의 보기 링크 대상.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_partner_view?mode&partnerID`
- page_title `PointNexus 파트너 상세` + h4 `<small>GET /partner/{partnerID}</small>`
- inline style: `.uuid`(11px), `.section-title`, `.label-col`
- 필터: 환경(autoSubmit=false) + 파트너 UUID text(`partnerID`) + 조회
- persona 색상: publisher=primary, manufacturer=success, distributor=info, store=warning, influencer=danger, platform=secondary, trader=dark (그 외 secondary)
- 분기: `partnerID` 없음 → alert-info / `error` → alert-danger / `partner`(배열이면[0]) → 상세 / 그 외 → alert-warning "데이터 없음"
- 상세:
  - **기본 정보** 카드: 이름/persona(badge 색상맵)/useAPI(badge success·secondary)/파트너 ID(uuid)
  - **계약(contracts)** 카드(N건): 없으면 "계약 정보 없음". 있으면 **동적 컬럼 테이블**(contract 키 합집합, `collectPnColumns`) + 셀 4분기:
    - array/object → `<code>` JSON
    - bool → badge(success/secondary, true/false)
    - GUID(`^[0-9a-f]{8}-[0-9a-f]{4}-`) → `.uuid` span (⚠️ #92 PnCellValue는 `text-monospace small` — 여기선 `.uuid`이므로 셀 렌더 인라인 재현)
    - else → 문자열
  - `PnJsonBox`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/partner-retrieve`

- 쿼리: `mode`, `partnerID`(UUID)
- 백엔드 책임: runPartnerRetrieve(partnerID), 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: { id, name, persona, useAPI: boolean, contracts: Record<string,unknown>[] } | [...],
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_partner_view.tsx` → `/goods/pointnexus/pointnexus_partner_view` (mode normalize + partnerID)
- screens: `screens/pointnexus-partner-view`
- entities: `pointnexus` 확장 — `PnPartnerDetail`/`PnPartnerRetrieveResponse`, `fetch/usePointNexusPartnerRetrieve` (`collectPnColumns` 재사용)
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/partner-retrieve`
- **#93 partner_view 링크 활성화**

## Parity 체크리스트

- [ ] partnerID 없음/error/데이터 없음 분기
- [ ] 기본 정보(persona 색상·useAPI)
- [ ] 계약 동적 컬럼·셀 4분기(GUID는 .uuid)
- [ ] "계약 정보 없음"·JSON 박스
