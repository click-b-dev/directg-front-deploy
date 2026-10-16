# 중국 결제요청 리스트

## 원본
- 파일: `pc/_Admin_/china/invoice_request.php` (278줄, 라이브) + `invoice_ps.php`(mode=invoice_delete)
- 도메인: `src/classes/China.php::getChinaInvoiceRequest`
- 참조 문서: `docs/migration/admin/china/invoice-list.md`(#218 자매 — 동일 필터/컬럼 구조)

## 화면·플로우
- 진입 URL: `/china/invoice_request` (사이드바) — GET `page`, `search_year`, `search_settle_no`, `search_name`, `search_email`
- **#218(결제완료 리스트)의 자매**: 검색필터·연도 select·번호 역순 20/page 전부 동일. 차이만 아래.
  - base 필터: **step='1' AND (flag='N' OR flag IS NULL)** (결제대기, #218은 step='2' 결제완료)
  - 결제상태: **"결제대기" 하드코딩** (#218은 "결제완료")
  - 컬럼: **10컬럼**(#218의 9 + 수정/삭제) — 번호/주문일자/결제번호/주문자명/주문자이메일/결제금액/결제일자/결제상태/**수정/삭제**
    - 수정: `invoice_modify.php?settle_no=` 링크(미이관, 후속 단위) btn-outline-secondary
    - 삭제: btn_delete(btn-danger, data-settleno) → AJAX invoice_delete
    - **메일전송 컬럼은 HTML 주석 처리(dead)**
  - 카운트 `{total_results} 개` (#218 동일 "개")
  - 결제번호 → `invoice_view.php?settle_no=` 링크(미이관)
- 분기/플로우:
  - **삭제**: 버튼 → confirm `[{settle_no}] 을(를) 삭제하시겠습니까?` → AJAX invoice_ps.php mode=invoice_delete, settle_no → **`window.location.reload()`**(목록 갱신)·**alert 없음(주석)**
  - 검색: GET 폼 재요청(연도 기본 현재년)
- 세션/권한: `lib.php` 관리자 세션 가드(공통).
- 죽은 코드: 상단 주석 SQL 블록(lines 77~99)·메일전송 컬럼·삭제 JS의 `data-idx`(엘리먼트는 data-settleno만 보유, idx=undefined 무해) — 미이관.

## 데이터 (legacy)
- 목록 `China::getChinaInvoiceRequest`:
  ```sql
  SELECT ord_ymd, settle_no, name, email, settle_price, cdt, step FROM directgames.tbl_invoice_order
  WHERE step='1' AND (flag='N' OR flag IS NULL) [add_where] ORDER BY ord_ymd DESC
  ```
  - 20/page, **전달 orderby "settle_no desc" 무시·ord_ymd desc 하드코딩**(#218 동일 quirk)
  - add_where: 연도범위(ord_ymd BETWEEN, 기본 현재년) + settle_no= / name LIKE / email=
- 삭제 `invoice_ps.php` mode=invoice_delete:
  - `DELETE FROM tbl_invoice_order WHERE settle_no=:settle_no`
  - `DELETE FROM tbl_invoice_order_item WHERE settle_no=:settle_no`
  - 성공 시 echo 없음(빈 응답) → reload

## API 계약 (백엔드 전달)
- `GET /admin/china/requests` — 결제요청(결제대기) 목록
  - 요청: `page`(기본 1), `search_year`(기본 현재년), `search_settle_no`, `search_name`, `search_email`
  - 응답: `{ items: [{ ord_ymd, settle_no, name, email, settle_price, cdt }], pagination: { current_page, results_per_page:20, total_results, total_pages } }` (#218과 동일 shape)
  - 백엔드: base `step='1' AND (flag='N' OR flag IS NULL)`, 정렬 `ord_ymd DESC`, 연도 범위, 20/page
- `POST /admin/china/orders/delete` — 주문서 삭제
  - 요청: `{ settle_no }`
  - 응답: `{ success: boolean }` (legacy 빈 응답 → reload)
  - 백엔드: tbl_invoice_order + tbl_invoice_order_item 삭제(settle_no)

## 타겟 매핑
- 라우트: `/china/invoice_request` (`routes/china/invoice_request.tsx`)
- screens: `screens/china-invoice-request`
- entities: `entities/china` 확장(request list 재사용 타입 + order delete). `ChinaInvoiceItem`/`ChinaInvoiceListSearch`/`ChinaInvoiceListResponse` 재사용(#218 동일 shape).
- mock: `handlers/china` 확장(GET requests + POST orders/delete)
- 미이관 링크: `invoice_view`(상세)·`invoice_modify`(수정) — 후속 단위

## Parity 체크리스트
- [ ] 화면 요소 일치 (검색필터 4종·10컬럼·카운트 "개"·연도 select)
- [ ] 필드/검증 일치 (연도 기본 현재년·결제상태 "결제대기")
- [ ] 분기/플로우 일치 (삭제 confirm 문구·삭제 후 reload·alert 없음·수정/상세 링크)
- [ ] 엣지케이스 일치 (번호 역순 20/page·정렬 ord_ymd desc·step='1' base·빈 목록)
