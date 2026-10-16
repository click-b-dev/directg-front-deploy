# Genba API - 연결확인

## 원본

- 파일: `pc/_Admin_/goods/genba/genba_ping.php` (라이브)
- 신규 도메인(Genba) — `genba` 엔티티 신설.

## 화면·플로우

- 진입 URL/파라미터: `/goods/genba/genba_ping` (파라미터 없음)
- 성격: **Genba API 연결 상태 확인(디버그 덤프).** 필터·테이블·mutation 없음.

- 화면 요소 (legacy 기준):
  - page_title `Genba 연결 테스트` (⚠️ 사이드바 라벨 "Genba 연결확인"과 상이 — page_title 그대로) / breadcrumb: 홈 > 상품 > Genba 관리 > Genba 연결 테스트
  - 카드 body: `print_r($genba->runGenbaPingAsync())` — ping 결과 원시 덤프.
  - (legacy는 runGenbaGetProductsAsync도 호출하나 결과 미표시 → 생략)

## 데이터 (legacy)

- `Genba2::runGenbaPingAsync()` — Genba API ping 결과.

## API 계약 (백엔드 전달)

### `GET /admin/genba/ping`

- 파라미터 없음.
- 백엔드 책임: Genba API ping 호출 결과 반환.

응답 `200`: ping 결과 객체. 프론트는 `<pre>` JSON 덤프.

## 타겟 매핑

- 라우트: `routes/goods/genba/genba_ping.tsx` → `/goods/genba/genba_ping`
- screens: `screens/genba-ping`
- entities: **신규 `genba`** — `GenbaPingResult`, `fetchGenbaPing`, `useGenbaPing`
- mock: **신규 `shared/mocks/handlers/genba.ts`**(handlers.ts 등록) — `GET /admin/genba/ping`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title "연결 테스트"/카드 덤프)
- [ ] 분기/플로우 일치 (필터·mutation 없음)
