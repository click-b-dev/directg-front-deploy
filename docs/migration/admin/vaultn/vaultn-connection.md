# Vaultn API - 퍼블리셔 현황

## 원본

- 파일: `pc/_Admin_/goods/vaultn/vaultn_connection.php` (라이브)
- 데이터: `Vaultn::runConnections()` — 연결(connection) 컬렉션.

## 화면·플로우

- 진입 URL/파라미터: `/goods/vaultn/vaultn_connection` (파라미터 없음)
- 성격: Vaultn 연결(퍼블리셔) 목록 표시. **필터·mutation·페이징 없음.**
- 제목:
  - breadcrumb: 홈 > 상품 > Valutn 관리(오타 원문 유지) > **Vaultn 퍼블리셔 현황**(=page_title)
  - h4 page-title: **`Connection V2(Returns a collection of connections)`** (하드코딩, page_title과 다름 — 원문 유지)
- 테이블(외곽 `table-dark`), 각 연결마다 **2행**:
  - 1행 3컬럼:
    - connectionGuid `<br/>(created)` — guid는 링크(→ `vaultn_connection_product.php?connectionGuid=<guid>`)
    - catalogSharingEnabled (PHP echo bool → true "1"/false "")
    - connectedOwner: **중첩 테이블** 1행 7컬럼(imageUrl 이미지 `img-thumbnail` / name / companyName / guid / country / timezone / defaultCurrencyCode)
  - 2행: colspan=3, "프로모션 바로가기" 링크(→ `vaultn_connection_promotion.php?connectionGuid=<guid>`)

## 데이터 (legacy)

- `Vaultn::runConnections()` — 각 원소: `guid`, `created`, `catalogSharingEnabled`, `connectedOwner{imageUrl,name,companyName,guid,country,timezone,defaultCurrencyCode}`

## API 계약 (백엔드 전달)

### `GET /admin/vaultn/connections`

- 파라미터 없음.
- 백엔드 책임: Vaultn connections API 결과 반환.
- 응답 `200`:
  ```
  { items: {
      guid, created, catalogSharingEnabled,
      connectedOwner: { imageUrl, name, companyName, guid, country, timezone, defaultCurrencyCode }
    }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/vaultn/vaultn_connection.tsx` → `/goods/vaultn/vaultn_connection`
- screens: `screens/vaultn-connection`
- entities: `vaultn` 확장 — `VaultnConnectionItem`, `VaultnConnectionOwner`, `VaultnConnectionListResponse`, `fetchVaultnConnections`, `useVaultnConnections`
- mock: `handlers/vaultn` 확장 — `GET /admin/vaultn/connections`
- 링크 대상(`vaultn_connection_product`, `vaultn_connection_promotion`)은 **아직 미이관** — legacy URL 구조(`/goods/vaultn/...?connectionGuid=`)로 `<a href>` 유지, 후속 단위에서 라우트/Link 연결.

## Parity 체크리스트

- [ ] breadcrumb(오타 Valutn 포함)·h4 하드코딩 문구
- [ ] 연결별 2행 구조·중첩 owner 테이블 7컬럼
- [ ] guid/프로모션 링크(connectionGuid 전달)
- [ ] catalogSharingEnabled bool 표시(1/빈칸)
