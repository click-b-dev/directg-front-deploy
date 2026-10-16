# 입금대기 내역 (mypage/order-waiting-list)

## 원본
- 파일: `pc/mypage/mypage_order_wating.html` (라이브 — `aside_mypage.html:20` "입금대기 내역" 링크 대상. 파일명 오타 "wating" 그대로. `yjs_mypage_order_wating.html`은 죽은 파일)
- 도메인 클래스: `Mypage2::getOrderList_vbank`(kcp_log/payco_log LEFT JOIN + 페이징), `Goods::getGoodsItemDetail`(플랫폼 아이콘)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/PAYMENT-APPROVAL.md`, `ORDER-WORKFLOW-AUDIT.md`
- 선례: `screens/mypage-order`(주문완료 내역, 뱃지/플랫폼svg/ServerPagination), `entities/mypage-order`

## 화면·플로우
- 진입 URL: `/mypage/mypage_order_wating.html`, GET `?page=N&search_product_name=S&search_date=C`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > `aside_mypage`(active `order_wating`) + `section#content.content.rounded-0.font-14`. **footer_banner 없음**.
- **검색 폼 없음(quirk)**: PHP는 `search_date`/`search_product_name` 필터 로직 + JS `$("input[name=search_date]").click→#orderFrm.submit()`을 갖지만 **body에 폼 마크업이 없다**. 라디오·`#orderFrm` 미존재 → JS는 dead. 필터는 URL 파라미터로만 서버 적용(수동 크래프팅 시). 재현: 폼 UI 미도입, searchParams는 API로 통과(기본 search_date="0" → 최근 6개월).
- 표 5열(colgroup 15/*/8/20/8):
  1. 주문일자(결제번호): `order_date` / `(settle_no)`
  2. 상품정보: **settle_no 그룹 내 items 반복** — 각 item = 플랫폼 아이콘(col-2) + col-10[delivery_type 뱃지 + product_name + `number_format(price)` 원]. item 사이 `<hr class="my-2">`(idx>0)
  3. 주문금액: `number_format(amount)` 원 (주문 총액: kcp `c.amount`/payco `paymentAmt`)
  4. 진행상태: (step=1일 때만) 입금대기/입금마감 뱃지 + `{bank_name} {account}` + kcp(예금주 depositor + 입금마감 `m월 d일 H:i`) / payco(입금마감 `m월 d일`)
  5. 비고: 상세보기 → `/mypage/mypage_order_wating_view.html?settle_no={settle_no}` (상세뷰는 별도 미이관 단위)
- 빈 목록: "주문 이력이 존재하지 않습니다." colspan=5 (legacy `count(orders)==0`)
- 하단: `#pagination`(links_html) — param에 검색조건 포함(raw `$_GET`)
- 세션/권한: **로그인 필수**

### 상태·포맷 로직 (view — 원본 재현)
- 입금대기/입금마감 판정(원본): `$va_date`가 8자리면 `+'235959'` 패딩 → `time() > strtotime($va_date)`면 "입금마감"(`bg-danger`), 아니면 "입금대기"(`bg-warning`). va_date: kcp=full datetime(패딩無), payco=YYYYMMDD(패딩有=당일 마감). **now 비교 → 백엔드가 판정(`deposit_status`)** — kcp/payco 원본 포맷 파싱·tz(KST)·now 비교는 백엔드 책임(프론트 date 파싱 divergence 방지).
- 입금마감 표시(원본 `date()`): kcp `m월 d일 H:i`(zero-padded, 예 "09월 10일 23:59") / payco `m월 d일`(예 "09월 10일"). **프론트가 ISO va_date에서 문자열 추출로 포맷**(now 무관, tz 영향 없음).
- delivery_type 뱃지: 1→`badge-outline-success` "코드발송" / 2→`badge-outline-post` "택배발송" / 3→`badge-outline-code-post" "코드+택배발송" (그 외 빈 `d-block mb-1` div만)
- 플랫폼 아이콘(`mx-auto d-block rounded-0`): 1→steam.svg / 34→epic_w.svg / 35→rockstar_2.svg / 51→holomodels.svg(+`w-75`) / else 없음 (order-list와 동일 svg 4종, 이미 public 복사됨)

## SSR·SEO (legacy)
- head: `<title>입금대기 내역</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- page/*.css 없음. moment.js+daterangepicker CDN 로드하나 **대상 요소·폼 없음 → no-op** → 미도입.
- 전 구간 SSR.

## 데이터 (legacy)
- `getOrderList_vbank($page,$where,$orderby,$param)`: `SELECT a.payment_method,a.ord_ymd,a.step,b.*,c.res_msg,c.tno,c.amount,c.app_time,c.bank_name,c.depositor,c.account,c.va_date,d.* FROM tbl_order a INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no LEFT JOIN kcp_log c ON a.settle_no=c.settle_no AND a.payment_method='SC0040' LEFT JOIN payco_log d ON a.settle_no=d.sellerOrderReferenceKey WHERE {where} ORDER BY b.order_item_id DESC` — 20건/page.
  - where: `a.step='1' AND b.status='3' AND b.m_no='{세션}'` + `a.ord_ymd >= {start}` + `a.ord_ymd <= {end}` + `b.product_name LIKE '%{search}%'`
- **그룹핑(settle_no 기준)**: order_item 행들을 settle_no로 묶어 주문 1건 + items[]. provider 판정: `payment_method=='SC0040'`→kcp(c: amount/account/bank_name/depositor/va_date), `=='PAYCO'`→payco(`json_decode(d.paymentDetails)` 순회 → `nonBankbookSettleInfo`의 bankName/accountNo/paymentExpirationYmd, amount=`paymentAmt`; **마지막 payment 값 유지**, depositor 없음).
  - item 필드: ordno, product_name, product_code, price, delivery_type, status
- per-item enrich: `getGoodsItemDetail(product_code)['product_platform']`(플랫폼 아이콘용)
- search_date 기간 계산: order-list와 동일(0=6개월/1~6=년, 6번 quirk). 백엔드 책임.
- 주석(legacy): "kcp 테이블만 조인, 페이코 가상계좌도 조회 필요" — 이미 payco_log LEFT JOIN 추가됨(라이브 반영).

## 결제(PG) — 해당
- 가상계좌 입금대기 목록(읽기 전용). kcp(SC0040)·payco 무통장 가상계좌 입금정보(은행/계좌/예금주/마감일) 표시. **결제 승인 플로우 아님**(조회만). va_date 파싱·입금대기/마감 판정은 백엔드.

## API 계약 (백엔드 전달)
- `GET /api/mypage/orders/waiting?page=N&search_product_name=S&search_date=C` (세션 쿠키) → `{ list: WaitingOrder[]; page; totalPages }`
  - `WaitingOrder { provider: "kcp"|"payco", order_date, settle_no, amount:number, step, bank_name, account, depositor: string|null, deposit_status: "waiting"|"closed", va_date, items: WaitingOrderItem[] }`
    - `va_date`: ISO 8601(KST) 입금마감 일시. 백엔드가 kcp datetime/payco YYYYMMDD 정규화.
    - `deposit_status`: 백엔드가 `now_KST > va_expiry` 판정(payco는 당일 23:59:59 패딩) → true="closed"(입금마감), false="waiting"(입금대기).
  - `WaitingOrderItem { ordno, product_name, product_code, price:number, delivery_type, status, product_platform }`
  - 백엔드 책임: (1) where(`step=1 AND status=3 AND m_no=세션`) + search_date 기간 + product_name LIKE, order_item_id DESC, 20건/page, (2) kcp_log/payco_log 조인 + settle_no 그룹핑 + provider별 필드 해석(payco paymentDetails JSON 파싱, 마지막 payment 유지), (3) va_date 정규화 + deposit_status 판정, (4) 각 item에 product_platform enrich. **페이징 단위 = order_item 20건**(그룹핑 전 기준, legacy와 동일).
- 응답 타입: `entities/mypage-order/model/waiting-types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_order_wating.html/page.tsx` → `/mypage/mypage_order_wating.html` (오타 "wating" 유지, `requireMemberSession()`, `getMypageOrdersWaiting` deep import)
- screen: `screens/mypage-order-waiting/ui/mypage-order-waiting-screen.tsx` (server) — aside + section + 표 5열 + ServerPagination. **검색폼 없음**.
- entities: `entities/mypage-order` 확장 (`getMypageOrdersWaiting` server + `waiting-types.ts`)
- 공용: `shared/ui/server-pagination`(baseUrl `/mypage/mypage_order_wating.html`, params={search_product_name, search_date})
- 자산: 플랫폼 svg 4종(order-list에서 복사 완료 — 재사용)
- mock: `shared/mocks/fixtures/mypage-orders-waiting.ts` + handler `GET */api/mypage/orders/waiting`

## Parity 체크리스트
- [ ] aside(입금대기 active) + 표 5열(검색폼 없음) + 페이지네이션
- [ ] settle_no 그룹핑 + items 반복(hr 구분) + 플랫폼 아이콘 + delivery_type 뱃지
- [ ] 주문금액(order.amount) / 상품별 price
- [ ] 진행상태: 입금대기(warning)/입금마감(danger) + 은행/계좌 + kcp(예금주+마감 H:i)/payco(마감 날짜)
- [ ] 상세보기 링크(_wating_view) + 빈 목록 colspan=5
- [ ] SEO(title 입금대기 내역/description 빈/author H2interactive/viewport)
