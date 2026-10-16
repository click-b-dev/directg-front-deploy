# Ztorm API - 연결확인

## 원본

- 파일: `pc/_Admin_/goods/ztorm/ztorm_ping.php` (라이브)
- 신규 도메인(Ztorm) — `ztorm` 엔티티 신설.

## 화면·플로우

- 진입 URL/파라미터: `/goods/ztorm/ztorm_ping` (파라미터 없음)
- 성격: **Ztorm API 연결 상태 확인(디버그 덤프).** 필터·테이블·mutation 없음.

- 화면 요소 (legacy 기준):
  - page_title `Ztorm 연결 확인` / breadcrumb: 홈 > 상품 > **Genba 관리**(⚠️ copy-paste quirk — Ztorm이어야 하나 Genba로 표기, 그대로 이식) > Ztorm 연결 확인
  - 카드 body: `print_r($ztorm->runPing())` — ping 결과 원시 덤프.

## 데이터 (legacy)

- `Ztorm::runPing()` — Ztorm API `/ping` 호출 결과(배열).

## API 계약 (백엔드 전달)

### `GET /admin/ztorm/ping`

- 파라미터 없음.
- 백엔드 책임: Ztorm API ping 호출 결과를 그대로 반환(연결 실패 시 에러 포함 객체).

응답 `200`: ping 결과 객체(예: `{ "success": true, "status": "OK", "message": "pong", "server_time": "..." }`). 프론트는 `<pre>` JSON 덤프(print_r 대체).

## 타겟 매핑

- 라우트: `routes/goods/ztorm/ztorm_ping.tsx` → `/goods/ztorm/ztorm_ping`
- screens: `screens/ztorm-ping`
- entities: **신규 `ztorm`** — `ZtormPingResult`, `fetchZtormPing`, `useZtormPing`
- mock: **신규 `shared/mocks/handlers/ztorm.ts`**(handlers.ts 등록) — `GET /admin/ztorm/ping`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/breadcrumb Genba quirk/카드 덤프)
- [ ] 분기/플로우 일치 (필터·mutation 없음, ping 결과 표시)
