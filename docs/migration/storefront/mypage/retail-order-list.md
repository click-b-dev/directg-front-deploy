# 실물 상품 주문 내역 (mypage/retail-order-list)

## 원본
- 파일: `pc/mypage/mypage_retail_order.html` (**라이브 고아 화면** — 라이브 aside/사이트맵/주문상세 어디서도 링크 없음. `templete/inc/aside_mypage.html`(비라이브 템플릿)에만 `retail_order` 링크 존재. 직접 URL로만 접근. 개발자 승인: 고아 그대로 이관, aside 링크 미추가)
- **DB**: 별도 DGKR DB(`$conn_dgkr`) + `Mypage` 클래스 — 구 directg 실물주문 시스템(`retail_order` 테이블)
- 도메인 클래스: `Mypage::getRetailOrderList`(retail_order 조회+페이징)
- 벤더: bootstrap-daterangepicker → **실제 vendor 로드**(refund와 동일 방식, `shared/ui/date-range-picker` 재사용). 단 `showCustomRangeLabel` 미설정(기본 true — refund는 false).
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`
- 선례: `screens/mypage-refund`(환불 내역, 거의 동일 구조), `shared/ui/date-range-picker`

## 화면·플로우
- 진입 URL: `/mypage/mypage_retail_order.html`, GET `?page=N&search_start_date=S&search_end_date=E`(+ `search_goods_name` 읽으나 **where 미적용 = dead**). **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(**active 없음** — retail_order 키 라이브 aside 부재) + `section#content`. footer_banner 없음.
- 기간검색 카드: refund와 동일 마크업(라벨"기간검색" + `#reportrange` 박스 + readonly 시작/종료 input + 검색). daterangepicker 프리셋(오늘/어제/지난 7일/지난 30일/이번달/지난달/올해), `alwaysShowCalendars:true`, `cancelClass:btn-danger`, **`showCustomRangeLabel` 미설정(기본 true)**. 기본값: -1개월~오늘.
- 표 7열: 결제번호(settle_no) / 상품명(`goods_nm`) / 결제수단 / 결제금액(₩ dotum + number_format) / 주문일자(regdt) / 결제상태(`retailStepText[step]`) / 비고(상세보기→`mypage_retail_order_view.html?settle_no=`)
- **빈 목록: 빈 메시지 없음**(foreach만 — refund 동형)
- 하단: `#pagination`(links_html, 20건/page) — param에 start/end
- 세션/권한: **로그인 필수**

### 매핑 (view — 프론트 파생)
- 결제수단: `pg_provider=="naverpay"`면 **"네이버페이\<br\>" 선행 출력** + retail settlekind 라벨
  - retail settlekind: CARD=카드결제, BANK=계좌이체, POINT=포인트, PHONE=휴대폰, GIFT=상품권, KAKAOM=카카오머니, NPAY=네이버페이 포인트, DGPOINT=전액할인 (**refund의 SC00xx와 다른 코드체계**)
  - legacy quirk: `$settlekind` 미초기화 — 미매핑 코드면 직전 행 값 유지(희귀 edge). 이식은 미매핑→"" 처리(문서화).
- 결제상태(`retailStepText`): 0주문완료/1결제대기/2결제완료/3배송준비중/4배송중/5배송완료/6구매확정/8취소요청/9취소완료/97취소보류/11반품요청/12반품수거중/13반품수거완료/14반품완료/17반품보류/18반품반려중/19반품반려완료/21교환요청/22수거중/23수거완료/24교환중/25교환완료/27교환보류/28교환반려중/29교환반려완료
- 결제금액: `<span style="font-family:dotum">\</span> {number_format(settleprice)}` (dotum `\`=₩)

## SSR·SEO (legacy)
- head: `<title>실물 상품 주문 내역</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- 추가 CSS: `icons.min.css`(mdi) + `daterangepicker.css`(CDN) + `daterangepicker-dark.css`(로컬) — refund에서 이미 도입, 재사용.
- 목록 SSR, 기간검색 카드만 client(vendor).

## 데이터 (legacy)
- **DGKR DB** `Mypage::getRetailOrderList`: `SELECT * FROM retail_order WHERE {where} ORDER BY id DESC` — 20건/page.
  - where: `m_no='{세션}'` + `ord_ymd >= {start}` + `ord_ymd <= {end}`
  - 표시 필드: settle_no, goods_nm, pg_provider, settlekind, settleprice, regdt, step

## 결제(PG) — 해당
- 실물상품 주문 목록 조회 전용(읽기). **별도 DGKR DB `retail_order`**. mutation 없음.

## API 계약 (백엔드 전달)
- `GET /api/mypage/retail-orders?page=N&search_start_date=S&search_end_date=E` (세션) → `{ list: RetailOrderItem[]; page; totalPages }`
  - `RetailOrderItem { settle_no, goods_nm, pg_provider, settlekind, settleprice:number, regdt, step }`
  - 백엔드: **별도 DGKR `retail_order`** 조회, where(`m_no=세션` + ord_ymd 기간), id DESC, 20건/page. search_goods_name 미적용(legacy 동일).
- 응답 타입: `entities/mypage-order/model/retail-order-types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_retail_order.html/page.tsx` → `/mypage/mypage_retail_order.html` (`requireMemberSession()`, `getMypageRetailOrders` deep import, 기본 -1month~오늘)
- screen: `screens/mypage-retail-order/ui/mypage-retail-order-screen.tsx` (server) — 기간검색 카드(`DateRangePicker`, showCustomRangeLabel=true) + 표 7열 + ServerPagination
- 공용: `shared/ui/date-range-picker`(refund와 공유 — `showCustomRangeLabel` prop 추가), `shared/ui/server-pagination`(baseUrl `/mypage/mypage_retail_order.html`, params={search_start_date, search_end_date})
- entities: `entities/mypage-order` 확장 (`getMypageRetailOrders` server + `retail-order-types.ts`)
- mock: `shared/mocks/fixtures/mypage-retail-orders.ts` + handler `GET */api/mypage/retail-orders`

## Parity 체크리스트
- [ ] aside(active 없음) + 기간검색 카드(daterangepicker, showCustomRangeLabel 기본) + 표 7열 + 페이지네이션
- [ ] 결제수단(naverpay `<br>` 선행 + retail settlekind 맵) / 결제상태(retailStepText 26종) / 결제금액(₩ dotum)
- [ ] 상품명 goods_nm / 상세보기 링크(retail_order_view) / 빈 목록(메시지 없음)
- [ ] SEO(title 실물 상품 주문 내역/description 빈/author H2interactive/viewport)
