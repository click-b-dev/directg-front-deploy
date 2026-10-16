# PointNexus - VCNT 미입금 만료 취소

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_vcnt_cancel.php` (UI), `_batch.php` (배치 AJAX)
- 대상: KCP 가상계좌(VCNT) 주문 중 입금기한(va_date) 만료 + 미입금(step='1')인데 PointNexus 예약/판매가 아직 활성인 건.
- **취소 실행 버튼(btnRun/btnStop/runLog)은 legacy에서 주석처리 → 미노출.** 실제 동작은 **"취소 대상 조회"(dry_run)** 뿐.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_vcnt_cancel?mode`
- page_title `PointNexus VCNT 미입금 만료 취소` + h4 `<small>VCNT 미입금 만료 → runBookCancel / runOperationCancel</small>`
- inline style: `.stat-card .stat-value`, `#targetTable`, `.run-log`(취소 실행 주석 영역용)
- 통계 2카드: 현재 취소 대상 주문(target_cnt, text-danger) / 기준 시각(now, 서버)
- 조회 설정: 환경(autoSubmit) + warning alert(대상 설명)
- 버튼: "취소 대상 조회"(btnPreview) — **취소 실행 버튼은 주석처리(미이식)**
- 취소 대상 목록 테이블 8컬럼: 주문일자/결제번호/회원/상품명/주문금액/상태/취소방식/마감시각(만료)
  - 초기: "\"취소 대상 조회\"를 눌러주세요."
  - 조회 클릭 → `POST vcnt_cancel_batch {mode, dry_run:1, limit:1000}` → `{success, count, has_more, items, error}`
  - 렌더: 결제번호 order_view 링크(settle_no) / status badge(booked=secondary, pending_reveal=warning, sold=info, else light) / 취소방식(action) / 마감시각(va_date, text-danger)
  - listCount: `(주문 N건 / 항목 M개[, 1000건 초과분 제외])`, targetCnt 갱신
  - 실패 → 오류 행, 네트워크 오류 처리

## dry_run item

`{ ordno, settle_no, reg_date, m_id, total_price, va_date, productID, name, operationID, status, action('bookCancel'|'cancel'), result:'preview', message }`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/vcnt-cancel-stats`

- 쿼리: `mode`
- 백엔드 책임: 대상(미입금 만료+활성 최신 row) 주문 수 COUNT.
- 응답 `200`: `{ target_cnt: number, now: string }` (now = 기준 시각 'Y-m-d H:i:s')

### `POST /admin/pointnexus/vcnt-cancel-batch`

- 요청: `{ mode, dry_run: 1, limit: 1000 }` (프론트는 dry_run만)
- 백엔드 책임: 대상 ordno + 주문정보 조인, dry_run이면 API 호출 없이 대상만 반환(limit+1로 has_more 판정).
- 응답 `200`:
  ```
  { success: boolean, mode, limit, dry_run,
    count: number, has_more: boolean,
    canceled_ok, canceled_fail,
    items: { ordno, settle_no, reg_date, m_id, total_price, va_date, productID, name, operationID, status, action, result, message }[],
    error: string|null
  }
  ```
- (취소 실행 dry_run=0은 legacy 주석처리 상태이므로 이번 이관 범위 밖. 계약만 유지, 프론트 미사용.)

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_vcnt_cancel.tsx` → `/goods/pointnexus/pointnexus_vcnt_cancel`
- screens: `screens/pointnexus-vcnt-cancel`
- entities: `pointnexus` 확장 — `PnVcntCancelStats`/`PnVcntCancelItem`/`PnVcntCancelBatchResult`, `fetchPointNexusVcntCancelStats`/`previewPointNexusVcntCancel`, `usePointNexusVcntCancelStats`
- mock: `handlers/pointnexus` 확장 — stats GET + vcnt-cancel-batch POST(dry_run)
- 링크: order_view(외부 admin) 미이관 `<a href>`

## Parity 체크리스트

- [ ] 통계 2카드(대상 수/기준 시각)
- [ ] 조회 설정(환경 autoSubmit)·warning alert·"취소 대상 조회" 버튼
- [ ] 조회 → 8컬럼 렌더·결제번호 링크·status badge·마감시각·listCount
- [ ] 취소 실행 버튼 미노출(legacy 주석처리 그대로)
