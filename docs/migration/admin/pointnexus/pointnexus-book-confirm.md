# PointNexus - Book Confirm

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_book_confirm.php` (목록+처리 폼), `_ps.php` (confirm/cancel PRG)
- 데이터: `tbl_order_item_pointnexus`(booked 상태 latest) + `tbl_order_item` 조인 / `runBookConfirm`·`runBookCancel`
- KCP 가상계좌 webhook 누락 등으로 booked 잔존한 건의 **수동 confirm/cancel** 화면.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_book_confirm?mode&ordno&m_id&page`
- page_title `PointNexus Book Confirm` + h4 `<small>tbl_order_item_pointnexus where status='booked' / POST /book/{id}/confirm · /book/{id}/cancel</small>`
- inline style: `.uuid`(11px), `.opid`(11px teal), `.ordno`(11px), `.tbl-bc`
- flash(처리 결과)·db_error 분기 알림
- 필터: 환경 select(**전체/Sandbox(test)/Production(prod)** — 전체 옵션 포함, 직접 select)/ordno(text)/m_id(text) + 검색 + 초기화(링크)
- 목록: `(ordno, productID)`별 최신 row가 `action='book' AND status='booked'`인 것. idx DESC, **30/page**, `pn_pagination_html`
- "booked 상태 N건" + page x/y
- 9컬럼:
  1. idx
  2. m_no/m_id (m_id + no.m_no)
  3. ordno: settle_no 있으면 order_view 링크(외부 admin) / 없으면 ordno + "tbl_order_item 매칭 없음"
  4. productID: product_view 링크(row_mode) + license_platform badge(있으면)
  5. operationID: operation 링크(row_mode) + clientRequestID(있으면 req:)
  6. price: `number_format(price)` + currency
  7. mode: badge(prod=danger, test=warning)
  8. reg_date
  9. 처리: Confirm 버튼(confirm 대화) + Cancel 버튼(confirm 대화)
- empty → "조회된 booked 행이 없습니다."
- 하단 안내 카드(webhook 설명)
- row_mode = mode=='prod' ? 'prod' : 'test'

## 처리(_ps.php, PRG)

- Confirm: `runBookConfirm(operationID)` → license.key 발급 시 confirm row insert → flash success / 실패 danger
- Cancel: `runBookCancel(operationID)` → 성공 시 bookCancel row / 실패 시 GET operation으로 종료(state cancelled/expired/error) 검증 후 forceCancel 강제정리 or 경고
- 가드: 대상 없음/최신 아님(race)/상태 불가/operationID 빈값 → 각 경고·오류 메시지
- 모두 **백엔드 책임**. 프론트는 confirm 대화 → mutation → flash + 재조회.

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/book-confirm`

- 쿼리: `mode`(''|test|prod), `ordno`(LIKE), `m_id`(LIKE), `page`
- 응답 `200`:
  ```
  { items: {
      idx, m_no, m_id, ordno, productID, operationID, license_platform,
      currency, countryCode, price, vat, clientRequestID, status, mode,
      reg_date, update_date, settle_no
    }[],
    total: number
  }
  ```

### `POST /admin/pointnexus/book-confirm/action`

- 요청: `{ action: "confirm"|"cancel", idx: number }`
- 백엔드 책임: 위 _ps 로직(runBookConfirm/runBookCancel + 로그 insert + race/상태 가드).
- 응답 `200`: `{ success: boolean, message: string, flash_type: string }`

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_book_confirm.tsx` → `/goods/pointnexus/pointnexus_book_confirm`
- screens: `screens/pointnexus-book-confirm`
- entities: `pointnexus` 확장 — `PnBookConfirmSearch`/`PnBookRow`/`PnBookConfirmResponse`/`PnBookActionResult`, `fetch/usePointNexusBookConfirm`, `runPointNexusBookAction`/`usePointNexusBookAction`
- mock: `handlers/pointnexus` 확장 — book-confirm GET + action POST
- 링크: order_view(외부 admin)·product_view 미이관 `<a href>`, operation은 SPA(#98)

## Parity 체크리스트

- [ ] 필터 3종(전체 mode)·30/page·페이지네이션
- [ ] 9컬럼·조건부 링크·mode badge·price
- [ ] Confirm/Cancel(confirm 대화 문구)→mutation→flash+재조회
- [ ] empty·안내 카드·db_error/flash 알림
