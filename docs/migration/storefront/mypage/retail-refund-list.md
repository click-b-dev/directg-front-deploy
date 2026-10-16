# 실물 상품 취소 내역 (mypage/retail-refund-list)

## 원본
- 파일: `pc/mypage/mypage_retail_refund.html` (**라이브 고아 화면** — 라이브 `inc/aside_mypage.html`에 `retail_refund` 링크 없음. `$aside_menu['retail_refund']`는 세팅되나 라이브 aside에 매칭 링크 부재 → active 하이라이트 미적용. 직접 URL로만 접근. 선례 retail_order와 동일하게 고아 그대로 이관, aside 링크 미추가)
- **DB**: 별도 DGKR DB(`$conn_dgkr`) + `Mypage` 클래스 — `retail_order` 테이블(retail_order 목록과 동일 소스, step 필터만 다름)
- 도메인 클래스: `Mypage::getRetailOrderList`(retail_order 조회+페이징) — retail_order 목록과 **완전히 동일한 메서드**
- 벤더: bootstrap-daterangepicker → **실제 vendor 로드**(`shared/ui/date-range-picker` 재사용). `showCustomRangeLabel` 미설정(기본 true — retail_order와 동일).
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`
- 선례: `screens/mypage-retail-order`(**거의 동일 구조** — 표/맵/daterangepicker 공유), `shared/ui/date-range-picker`

## retail_order(완료)와의 차이 (이 단위의 전부)
| 항목 | retail_order (완료) | **retail_refund (이 단위)** |
| --- | --- | --- |
| SEO `<title>` / page_title | "실물 상품 주문 내역" | **"실물 상품 취소 내역"** |
| WHERE step 필터 | 없음(전체 step) | **`(step='8' OR '9' OR '11' OR '12' OR '13' OR '14')`** — 취소요청/취소완료/반품요청/반품수거중/반품수거완료/반품완료 |
| action / baseUrl | `/mypage/mypage_retail_order.html` | **`/mypage/mypage_retail_refund.html`** |
| aside active 키 | `retail_order`(라이브 부재) | `retail_refund`(라이브 부재) → 둘 다 하이라이트 없음 |

그 외 전부 동일: 표 7열, RETAIL_SETTLE_KIND 맵, RETAIL_STEP_TEXT 맵(26종), ₩ dotum, daterangepicker 프리셋/설정, 기본값 -1개월~오늘, 빈 목록(메시지 없음), DGKR DB, **m_no=세션**(retail_order_view의 하드코딩과 다름 — 여기는 세션 m_no), id DESC, 20건/page, 상세보기→`mypage_retail_order_view.html?settle_no=`.

## 화면·플로우
- 진입 URL: `/mypage/mypage_retail_refund.html`, GET `?page=N&search_start_date=S&search_end_date=E`(+ `search_goods_name` 읽으나 **WHERE 미적용 = dead**, retail_order 동일). **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(**active 하이라이트 없음** — retail_refund 키 라이브 aside 부재) + `section#content.content.rounded-0.font-14`. footer_banner 없음.
- 기간검색 카드: retail_order/refund와 동일 마크업(라벨"기간검색" + `#reportrange` 박스 + readonly 시작/종료 input + 검색 버튼). daterangepicker 프리셋(오늘/어제/지난 7일/지난 30일/이번달/지난달/올해), `alwaysShowCalendars:true`, `cancelClass:btn-danger`, **`showCustomRangeLabel` 미설정(기본 true)**. 기본값: -1개월~오늘.
- 표 7열: 결제번호(settle_no) / 상품명(`goods_nm`) / 결제수단 / 결제금액(₩ dotum + number_format) / 주문일자(regdt) / 결제상태(`retailStepText[step]`) / 비고(상세보기→`mypage_retail_order_view.html?settle_no=`)
- **빈 목록: 빈 메시지 없음**(foreach만 — retail_order 동형)
- 하단: `#pagination`(links_html, 20건/page) — param에 start/end
- 세션/권한: **로그인 필수**

### 매핑 (view — 프론트 파생, retail_order와 동일)
- 결제수단: `pg_provider=="naverpay"`면 **"네이버페이\<br\>" 선행 출력** + retail settlekind 라벨
  - retail settlekind: CARD=카드결제, BANK=계좌이체, POINT=포인트, PHONE=휴대폰, GIFT=상품권, KAKAOM=카카오머니, NPAY=네이버페이 포인트, DGPOINT=전액할인. 미매핑→"".
- 결제상태(`retailStepText`, 26종): 0주문완료/1결제대기/2결제완료/3배송준비중/4배송중/5배송완료/6구매확정/8취소요청/9취소완료/97취소보류/11반품요청/12반품수거중/13반품수거완료/14반품완료/17반품보류/18반품반려중/19반품반려완료/21교환요청/22수거중/23수거완료/24교환중/25교환완료/27교환보류/28교환반려중/29교환반려완료
  - ※ 목록은 step 필터로 {8,9,11,12,13,14}만 조회되나, 맵은 legacy verbatim 전체 유지.
- 결제금액: `<span style="font-family:dotum">\</span> {number_format(settleprice)}` (dotum `\`=₩)

## SSR·SEO (legacy)
- head: `<title>실물 상품 취소 내역</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- 추가 CSS: `icons.min.css`(mdi) + `daterangepicker.css`(CDN) + `daterangepicker-dark.css`(로컬) — 이미 도입됨, 재사용.
- 목록 SSR, 기간검색 카드만 client(vendor).

## 데이터 (legacy)
- **DGKR DB** `Mypage::getRetailOrderList`: `SELECT * FROM retail_order WHERE {where} ORDER BY id DESC` — 20건/page.
  - where: `m_no='{세션}'` + **`(step IN 8,9,11,12,13,14)`** + `ord_ymd >= {start}` + `ord_ymd <= {end}`
  - 표시 필드: settle_no, goods_nm, pg_provider, settlekind, settleprice, regdt, step

## 결제(PG) — 해당
- 실물상품 취소/반품 목록 조회 전용(읽기). **별도 DGKR DB `retail_order`**. mutation 없음.

## API 계약 (백엔드 전달)
- `GET /api/mypage/retail-refunds?page=N&search_start_date=S&search_end_date=E` (세션) → `{ list: RetailOrderItem[]; page; totalPages }`
  - `RetailOrderItem { settle_no, goods_nm, pg_provider, settlekind, settleprice:number, regdt, step }` (retail-orders와 동일 형태 → `retail-order-types.ts` 재사용)
  - 백엔드: **별도 DGKR `retail_order`** 조회, where(`m_no=세션` + **`step IN (8,9,11,12,13,14)`** + ord_ymd 기간), id DESC, 20건/page. `search_goods_name` 미적용(legacy 동일).
  - retail-orders(step 필터 없음)와 **step 필터만 다른 별도 엔드포인트**로 분리(취소/반품 내역 전용 계약).
- 응답 타입: `entities/mypage-order/model/retail-order-types.ts` 재사용(`RetailOrderItem`/`MypageRetailOrderResponse`)

## 타겟 매핑
- 라우트: `app/mypage/mypage_retail_refund.html/page.tsx` → `/mypage/mypage_retail_refund.html` (`requireMemberSession()`, `getMypageRetailRefunds` deep import, 기본 -1month~오늘)
- screen: `screens/mypage-retail-refund/ui/mypage-retail-refund-screen.tsx` (server) — 기간검색 카드(`DateRangePicker`, showCustomRangeLabel=true) + 표 7열 + ServerPagination. retail-order-screen 구조 복제(action/baseUrl만 retail_refund).
- 공용: `shared/ui/date-range-picker`(재사용), `shared/ui/server-pagination`(baseUrl `/mypage/mypage_retail_refund.html`, params={search_start_date, search_end_date})
- entities: `entities/mypage-order` 확장 (`getMypageRetailRefunds` server fetcher + `retail-order-types.ts` 타입 재사용)
- mock: `shared/mocks/fixtures/mypage-retail-refunds.ts`(step 8/9/11/12/13/14만) + handler `GET */api/mypage/retail-refunds`

## Parity 체크리스트
- [ ] aside(active 없음) + 기간검색 카드(daterangepicker, showCustomRangeLabel 기본 true) + 표 7열 + 페이지네이션
- [ ] 결제수단(naverpay `<br>` 선행 + retail settlekind 맵) / 결제상태(retailStepText 26종) / 결제금액(₩ dotum)
- [ ] 상품명 goods_nm / 상세보기 링크(retail_order_view) / 빈 목록(메시지 없음)
- [ ] step 필터(8,9,11,12,13,14) 백엔드 계약 / baseUrl·action retail_refund
- [ ] SEO(title 실물 상품 취소 내역/description 빈/author H2interactive/viewport)
