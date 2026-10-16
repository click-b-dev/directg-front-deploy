# Vaultn API - 연결확인

## 원본

- 파일: `pc/_Admin_/goods/vaultn/vaultn_ping.php` (라이브)
- 신규 도메인(Vaultn) — `vaultn` 엔티티 신설.

## 화면·플로우

- 진입 URL/파라미터: `/goods/vaultn/vaultn_ping` (파라미터 없음)
- 성격: **Vaultn API 연결 상태 확인(디버그 덤프).** 필터·테이블·mutation 없음.
- 화면 요소:
  - page_title `Vaultn 연결 확인` / breadcrumb: 홈 > 상품 > Vaultn 관리 > Vaultn 연결 확인
  - 카드 body: `print_r($vaultn->runVaultnPingPost())` — ping 결과 원시 덤프.
  - (나머지 주문/sku 관련 debug 코드는 주석처리 → 미표시, 생략)

## 데이터 (legacy)

- `Vaultn::runVaultnPingPost()` — Vaultn API ping(POST) 결과.

## API 계약 (백엔드 전달)

### `GET /admin/vaultn/ping`

- 파라미터 없음.
- 백엔드 책임: Vaultn API ping 호출 결과 반환.

응답 `200`: ping 결과 객체. 프론트는 `<pre>` JSON 덤프.

## 타겟 매핑

- 라우트: `routes/goods/vaultn/vaultn_ping.tsx` → `/goods/vaultn/vaultn_ping`
- screens: `screens/vaultn-ping`
- entities: **신규 `vaultn`** — `VaultnPingResult`, `fetchVaultnPing`, `useVaultnPing`
- mock: **신규 `shared/mocks/handlers/vaultn.ts`**(handlers.ts 등록) — `GET /admin/vaultn/ping`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/카드 덤프)
- [ ] 분기/플로우 일치 (필터·mutation 없음)
