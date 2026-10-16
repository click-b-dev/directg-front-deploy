# PointNexus - 취소 검증 (cancel_pending)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_cancel_verify.php` (UI), `_batch.php` (배치 AJAX)
- 대상: 최신 row `status='cancel_pending'`(operationCancel 비동기 접수) — GET /operation으로 최종 상태 확정(비파괴).
- **대기 조회(dry_run)** + **검증 실행(배치 반복)** 둘 다 활성.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_cancel_verify?mode`
- page_title `PointNexus 취소 검증 (cancel_pending)` + h4 `<small>operationCancel 비동기 결과 → GET /operation 으로 확정</small>`
- inline style: `.stat-card .stat-value`, `#targetTable`, `.run-log`(+row 색상)
- 통계 2카드: 검증 대기(cancel_pending) 건수(target_cnt, text-warning) / 현재 시각
- 조회 설정: 환경(autoSubmit) + info alert(비파괴 설명)
- 버튼 3: "대기 항목 조회"(btnPreview, dry_run) / "검증 실행"(btnRun, 배치 반복) / "중단"(btnStop)
- 검증 대기 목록 테이블 7컬럼: 결제번호/상품명/productID/operationID/state/결과/메시지
  - 조회(dry_run) → `{mode, dry_run:1, limit:1000}` → 목록 렌더 + listCount + targetCnt 갱신
  - 결과 badge(ok=success, fail=danger, pending=secondary, preview=light)
  - 결제번호 settle_no → order_view 링크 / 없으면 ordno
- 실행 로그(run-log)
- **검증 실행 배치**: confirm → `while`:
  - `{mode, dry_run:0, limit:50}` → 배치 로그(canceled/cancel_failed/보류) + items별
  - `count===0` → 완료 / `!success` → 실패 후 중단 / 네트워크 오류 중단
  - **보류만(resolved_ok===0 && resolved_fail===0)** → "잠시 후 다시 실행" 후 종료(무한루프 방지)
  - `!has_more` → 종료. 마지막 종료 로그
  - 중단 요청 처리

## batch item / 응답

- item: `{ idx, ordno, settle_no, productID, name, operationID, state, result('preview'|'ok'|'fail'|'pending'), message }`
- 응답: `{ success, count, has_more, resolved_ok, resolved_fail, still_pending, items, error }`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/cancel-verify-stats`

- 쿼리: `mode`
- 응답 `200`: `{ target_cnt: number, now: string }`

### `POST /admin/pointnexus/cancel-verify-batch`

- 요청: `{ mode, dry_run: 0|1, limit }` (dry_run=1 → limit 1000 / 실행 → limit 50)
- 백엔드 책임: 최신 row cancel_pending 후보 조회(limit+1로 has_more), dry_run이면 목록만. 실행이면 `resolveCancelPending`(GET /operation → done→canceled / error→cancel_failed / 그 외 보류) UPDATE.
- 응답 `200`: 위 응답 스키마.

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_cancel_verify.tsx` → `/goods/pointnexus/pointnexus_cancel_verify`
- screens: `screens/pointnexus-cancel-verify`
- entities: `pointnexus` 확장 — `PnCancelVerifyStats`/`PnCancelVerifyItem`/`PnCancelVerifyBatchResult`, `fetchPointNexusCancelVerifyStats`/`runPointNexusCancelVerifyBatch`, `usePointNexusCancelVerifyStats`
- mock: `handlers/pointnexus` 확장 — stats GET + cancel-verify-batch POST(dry_run/실행)
- 링크: order_view 미이관 `<a href>`

## Parity 체크리스트

- [ ] 통계 2카드·환경 autoSubmit·info alert
- [ ] 대기 조회(dry_run)→7컬럼·결과 badge·결제번호 링크·listCount
- [ ] 검증 실행(confirm→배치 반복·보류만 종료·중단)·실행 로그(색상)
- [ ] idle/loading/error/empty 상태
