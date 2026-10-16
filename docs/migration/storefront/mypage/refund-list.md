# 환불(취소) 내역 (mypage/refund-list)

## 원본
- 파일: `pc/mypage/mypage_refund.html` (라이브 — **라이브 aside엔 링크 없음**. `aside_menu['refund2']`는 aside_mypage에 미존재. 진입: 마이그레이션된 사이트맵 "취소 내역" 링크(`/mypage/mypage_refund.html`) + `left_mypage.html`(구 aside). `yjs_mypage_refund.html`은 죽은 파일)
- **화면 제목**: "취소 내역" (파일명 refund ≠ title)
- **DB**: `$conn_dgkr`(**별도 DGKR DB** — 구 directg 주문 시스템) + `Mypage` 클래스(≠ Mypage2)
- 도메인 클래스: `Mypage::getOrderList`(dgkr `tbl_order` 조회+페이징), `Mypage::getOrderItemName`(상품명 집계)
- 벤더: bootstrap-daterangepicker(moment/jQuery) 기간검색 → **실제 vendor 로드**(개발자 승인 — legacy와 동일 CDN jQuery 3.7.1+moment+daterangepicker + dark CSS, 이 페이지 page-scoped. UI·동작 100% 동일)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/PAYMENT-APPROVAL.md`, `ORDER-WORKFLOW-AUDIT.md`
- 선례: admin `shared/ui/date-range-picker.tsx`(A안 원본), `screens/board-notice-list`(SSR+ServerPagination)

## 화면·플로우
- 진입 URL: `/mypage/mypage_refund.html`, GET `?page=N&search_start_date=S&search_end_date=E`(+ `search_goods_name` 읽으나 **where 미적용·폼 미존재 = dead**). **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(active 없음 — refund2 키 부재) + `section#content`. footer_banner 없음.
- 기간검색 카드(`card shadow-none rounded-0 my-3`): 라벨"기간검색"(col-sm-1) + `#reportrange` 박스(col-sm-3, "start - end" 표시)[daterangepicker] + 폼(col-sm-9, readonly 시작/종료 input + 검색 버튼)
  - daterangepicker 프리셋(legacy `ranges`): 오늘/어제/지난 7일/지난 30일/이번달/지난달/올해(작년은 주석). `showCustomRangeLabel:false`, `alwaysShowCalendars:true`, `cancelClass:btn-danger`. → **실제 vendor 초기화**(legacy 인라인 스크립트 동형: 프리셋 + 2개월 달력 + Cancel/Apply). 폼 GET submit(start/end, page 리셋).
  - 기본값: search_start_date 빈값→`-1 month`, search_end_date 빈값→오늘.
- 표 8열: 결제번호(settle_no) / 상품명(`getOrderItemName`) / 결제수단 / 결제금액(₩ dotum + number_format) / 주문일자(regdt) / 취소일자(canceldt) / 결제상태 / 비고(상세보기→`mypage_order_view.html?settle_no=`)
- **빈 목록: 빈 메시지 없음**(legacy foreach만 — 목록 비면 tbody 비어있음, "존재하지 않습니다" 행 없음)
- 하단: `#pagination`(links_html, 20건/page) — param에 start/end
- 세션/권한: **로그인 필수**

### 매핑 (view — 프론트 파생)
- 결제수단: `pg_provider=="naverpay" ? "네이버페이" : settlekind[settlekind]`
  - settlekind: 000000=현금, SC0000=무통장입금, SC0010=신용카드, SC0030=실시간 계좌이체, SC0040=가상계좌, SC0060=휴대폰, DG0000=전액할인, PAYCO=PAYCO, samsung=삼성페이, naverpay=네이버페이, POINT=네이버포인트
- 결제상태: settleStatus[step] — 0=결제완료, 1=결제대기, 2=결제완료, 3=결제실패, 9=결제취소, 99=주문취소
- 결제금액: `<span style="font-family:dotum">\</span> {number_format(settleprice)}` (dotum `\`=₩ 표시)

## SSR·SEO (legacy)
- head: `<title>취소 내역</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- 추가 CSS(legacy): `icons.min.css`(mdi 아이콘), `daterangepicker.css`(CDN), `daterangepicker-dark.css`(로컬). → **3종 모두 도입**(`icons.min.css`·`daterangepicker-dark.css` 로컬 복사, daterangepicker.css는 동일 CDN `<link>`). 실제 vendor 렌더에 필요.
- 목록 SSR, 기간검색 카드만 client(vendor 로드·초기화).

## 데이터 (legacy)
- **DGKR DB**(`$dsn_dgkr`) `Mypage::getOrderList`: `SELECT * FROM tbl_order WHERE {where} ORDER BY id DESC` — 20건/page.
  - where: `m_no='{세션}' AND (step='8' OR step='9' OR step='99')` + `ord_ymd >= {start}` + `ord_ymd <= {end}`
  - 표시 필드: settle_no, pg_provider, settlekind, settleprice, regdt, canceldt, step
- `Mypage::getOrderItemName(settle_no)`: dgkr `tbl_order_item`에서 product_nm 집계 — `count>1` 이면 `"{첫상품} 외 {count-1}건"`, else 첫상품.

## 결제(PG) — 해당
- 취소/환불된 주문(step 8·9·99) 조회 전용(읽기). 결제 실행/취소 mutation 없음. **별도 DGKR DB 조회** — 구 주문 데이터.

## API 계약 (백엔드 전달)
- `GET /api/mypage/refunds?page=N&search_start_date=S&search_end_date=E` (세션) → `{ list: RefundItem[]; page; totalPages }`
  - `RefundItem { settle_no, item_name, settlekind, pg_provider, settleprice:number, regdt, canceldt, step }`
  - **백엔드 책임**: (1) **별도 DGKR 데이터소스**(구 directg `tbl_order`) 조회, (2) where(`m_no=세션 AND step∈{8,9,99}`) + ord_ymd 기간, id DESC, 20건/page, (3) `item_name`은 dgkr `tbl_order_item` 집계(">1건이면 '{첫상품} 외 N건'"). search_goods_name 미적용(legacy 동일).
- 응답 타입: `entities/mypage-order/model/refund-types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_refund.html/page.tsx` → `/mypage/mypage_refund.html` (`requireMemberSession()`, `getMypageRefunds` deep import, 기본 기간 -1month~오늘)
- screen: `screens/mypage-refund/ui/mypage-refund-screen.tsx` (server) — 기간검색 카드(`DateRangePicker`) + 표 8열 + ServerPagination
- 공용(신규): `shared/ui/date-range-picker.tsx` (client, **실제 vendor 로드** — jQuery 3.7.1+moment+daterangepicker 순차 로드 후 legacy 인라인 스크립트 동형 초기화. 박스 "start - end", cb가 #reportrange2·input 갱신)
- entities: `entities/mypage-order` 확장 (`getMypageRefunds` server + `refund-types.ts`)
- 공용: `shared/ui/server-pagination`(baseUrl `/mypage/mypage_refund.html`, params={search_start_date, search_end_date})
- 자산: `public/assets/css/icons.min.css`(mdi) + `materialdesignicons-webfont.*`(폰트) + `daterangepicker-dark.css` 신규 복사(admin/legacy에서)
- mock: `shared/mocks/fixtures/mypage-refunds.ts` + handler `GET */api/mypage/refunds`

## Parity 체크리스트
- [ ] aside(active 없음) + 기간검색 카드(A안 daterangepicker) + 표 8열 + 페이지네이션
- [ ] daterangepicker: 실제 vendor UI(프리셋 7종 + 2개월 달력 + Cancel/Apply), 박스 "start - end", 기본 -1month~오늘
- [ ] 결제수단(naverpay 우선 + settlekind 맵) / 결제상태(settleStatus 맵) / 결제금액(₩ dotum)
- [ ] 상품명 집계(외 N건) / 상세보기 링크 / 빈 목록(메시지 없음)
- [ ] SEO(title **취소 내역**/description 빈/author H2interactive/viewport) + mdi 아이콘 CSS
