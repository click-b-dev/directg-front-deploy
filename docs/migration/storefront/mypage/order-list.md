# 주문완료 내역 (mypage/order-list)

## 원본
- 파일: `pc/mypage/mypage_order.html` (라이브 — `pc/inc/aside_mypage.html:21` "주문완료 내역" 링크가 이 파일 지정. `old_mypage_order.html`·`yjs_mypage_order.html`은 미참조 죽은 파일)
- 도메인 클래스: `Mypage2::getOrderList_v2`(목록+페이징), `Goods::getGoodsItemDetail`(썸네일/뱃지/플랫폼), `Order::getOrderShipment`+`Order::getShipmentStatus`(택배 배송상태)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`
- 선례: `screens/board-notice-list`(SSR 목록+검색+ServerPagination), `widgets/mypage-aside`(active `order2`), `entities/mypage-wishlist`(세션 목록 fetcher), `entities/product-thumb`(플랫폼 아이콘)

## 화면·플로우
- 진입 URL: `/mypage/mypage_order.html`, GET `?page=N&search_product_name=S&search_date=C`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(`grid-template-columns: 240px auto`) > `aside_mypage`(active `order2`) + `section#content.content.rounded-0.font-14`. **footer_banner 없음**(wishlist와 달리 순수 footer만).
- 검색 폼(`#orderFrm`, method=GET):
  1. 상품명 검색: `input[name=search_product_name]`(rounded-pill) + submit 버튼(fa-search). value 유지.
  2. 기간 라디오 7개(`name=search_date`): value 0="최근 6개월", 이후 value 1~6 = 현재년~5년전 "{YYYY}년"(라벨 `date('Y', -i year)`, i=0..5). **라디오에 `checked` 없음** — active는 label class(`btn-primary`/`btn-secondary`)로만 표기. 라디오 클릭 시 폼 submit(jQuery).
- 안내 alert(`cart_msg bg-alert`): "※ 한글패치 등 제공콘텐츠는 [혜택정보 > 제공콘텐츠](`/mypage/mypage_supply_content_v2.html`)에서 확인해 주시기 바랍니다." (정적)
- 표 7열(colgroup 15/20/*/8/8/8/8%):
  1. 주문일자(주문번호): `order_date` / `(ordno)`
  2. 상품정보(이미지+뱃지): `{domain}/upload/product/{product_code}/header/header.jpg` + game_type/display_type 뱃지(좌하단) + 플랫폼 아이콘(우측)
  3. 상품정보(텍스트): delivery_type 뱃지(코드발송/택배발송/코드+택배발송) + `product_name`
  4. 주문금액: `number_format(price)` + " 원"
  5. 진행상태: 코드수령상태(delivery_type=1) OR 배송상태(delivery_type≠1)
  6. 코드수령: delivery_type 1·3 → 구매확정/수령대기(`is_actv`)
  7. 비고: 상세보기 링크
- 빈 목록: "주문 이력이 존재하지 않습니다." colspan=7 (legacy `total_results==0`)
- 하단: `#pagination`(links_html, 정상) — `param`에 검색조건 포함(page 제외 전 GET 파라미터).
- 상세 링크: `/mypage/mypage_order{status=='3'?'_wating':''}_view.html?settle_no={settle_no}` (상세뷰는 별도 미이관 단위 — legacy URL만 유지)
- 세션/권한: **로그인 필수**(login_check)

### 뱃지·아이콘 매핑 (view 로직 — 프론트에서 파생)
- game_type/display_type 뱃지(`badge bg-{X} rounded-0 font-12 py-2`): game+basic→"기본게임"(info) / game+edition→"에디션"(primary) / game+multi→"멀티팩"(warning) / dlc→"DLC"(content) / music→"Music"(content) / bundle→"번들"(success) / holomodels+holomodels→"본체"(success) / holomodels+holomodelsdlc→"DLC"(content) / holomodels+holomodelsedition→"에디션"(primary) / else 없음
- 플랫폼 아이콘(`mx-auto d-block rounded-0`): product_platform 1→steam.svg / 34→epic_w.svg / 35→rockstar_2.svg / 51→holomodels.svg(+`w-75`) / else 없음. **legacy 전용 svg**(thumb 카드의 `*_logo.svg`와 다름) — public에 신규 복사.
- delivery_type 뱃지: 1→`badge-outline-success` "코드발송" / 2→`badge-outline-post` "택배발송" / 3→`badge-outline-code-post` "코드+택배발송"
- 진행상태(delivery_type=1, 코드수령): step=2&status=1&send_status=fail→`bg-danger` "발송오류" / step=2→`bg-label` "주문완료" / else→`bg-warning` "입금대기". 마크업 `<div class="mb-1"><span class="badge bg-{cls} font-12 py-2">{txt}</span></div>`
- 진행상태(delivery_type≠1, 배송): `<div class="mb-1"><span class="badge text-bg-info font-12 py-2">{getShipmentStatus(shipment_status)}</span></div>`. getShipmentStatus: 2→배송대기,3→배송준비,4→배송중,5→배송완료,6→구매확정, else 빈값.
- 코드수령(delivery_type 1·3): `<div class="mb-1"><span class="badge bg-label font-12 py-2">{is_actv=='1'?'구매확정':'수령대기'}</span></div>`

## SSR·SEO (legacy)
- head: `<title>주문 내역</title>`, `description=""`, `author=H2interactive`. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- page/*.css 별도 없음(header_common의 공통 CSS만). moment.js+daterangepicker CDN 로드하나 **이 페이지엔 daterangepicker 대상 요소 없음 → no-op**(라디오 auto-submit만) → 미도입.
- 전 구간 SSR(폼 GET 재요청). 클라이언트 필요: 라디오 click→submit 뿐.

## 데이터 (legacy)
- `getOrderList_v2($page,$where,$orderby,$param)`: `SELECT a.ord_ymd,a.step,b.* FROM tbl_order a INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no WHERE {where} ORDER BY b.order_item_id DESC` — 20건/page, `pagination` 클래스(total_results, links_html).
  - where: `((a.step='2' AND b.status='2') OR (a.step='1' AND b.status='3') OR (a.step='2' AND b.status='1' AND b.send_status='fail')) AND b.m_no='{세션}'` + `a.ord_ymd >= {start}` + `a.ord_ymd <= {end}` + `b.product_name LIKE '%{search}%'`
  - 표시 필드(b.\*): order_date, ordno, settle_no, product_code, product_name, price, delivery_type, status, send_status, is_actv (+ a.step)
- per-row enrich: `getGoodsItemDetail(product_code)` → domain, game_type, display_type, product_platform. delivery_type≠1이면 `getOrderShipment(settle_no,ordno)` → shipment_status.
- **search_date 기간 계산(서버, SQL 필터용)**: 0→최근 6개월(-6month~오늘) / 1→올해(1/1~12/말일) / 2→작년 / 3→2년전 / 4→3년전 / 5→4년전 / 6→5년전(단 start=5년전-현재월-현재일, end=5년전 12월 말일 — legacy quirk 그대로). 프론트는 코드만 전달, 백엔드가 구간 계산.

## API 계약 (백엔드 전달)
- `GET /api/mypage/orders?page=N&search_product_name=S&search_date=C` (세션 쿠키) → `{ list: MypageOrderItem[]; page; totalPages }`
  - `MypageOrderItem { order_date, ordno, settle_no, product_code, product_name, price:number, delivery_type, step, status, send_status, is_actv, domain, game_type, display_type, product_platform, shipment_status: string|null }`
  - 백엔드 책임: (1) where 절 3분기 + m_no=세션 필터, (2) `search_date` 코드→기간 계산(위 quirk 포함), (3) product_name LIKE 검색, (4) `order_item_id DESC`, 20건/page, (5) getGoodsItemDetail·getOrderShipment enrich를 각 행에 병합(프론트 N+1 없음). shipment_status는 delivery_type≠1일 때만(그 외 null).
- 응답 타입: `entities/mypage-order/model/types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_order.html/page.tsx` → `/mypage/mypage_order.html` (`requireMemberSession()`, `getMypageOrders(page, searchProductName, searchDate)` deep import, searchParams 파싱)
- screen: `screens/mypage-order/ui/mypage-order-screen.tsx` (server) — aside + section + `<OrderSearchForm>`(client) + alert + 표 + ServerPagination
- 컴포넌트: `screens/mypage-order/ui/order-search-form.tsx` (`'use client'`) — 상품명 input + 기간 라디오 7개(라디오 change→form.requestSubmit)
- entities: `entities/mypage-order` (`getMypageOrders` server, types)
- 공용: `shared/ui/server-pagination`(baseUrl `/mypage/mypage_order.html`, params={search_product_name, search_date})
- 자산: public `assets/images/platform/{steam,epic_w,rockstar_2,holomodels}.svg` 신규 복사
- mock: `shared/mocks/fixtures/mypage-orders.ts` + handler `GET */api/mypage/orders`

## Parity 체크리스트
- [ ] aside(주문완료 내역 active) + 검색폼(상품명+기간라디오7) + alert + 표 7열 + 페이지네이션
- [ ] 뱃지: game_type/display_type·delivery_type·진행상태(코드수령 3분기/배송 5단계)·코드수령(구매확정/수령대기)
- [ ] 플랫폼 아이콘 4종(steam/epic_w/rockstar_2/holomodels w-75) + 썸네일 URL
- [ ] 상세 링크 status=='3' 분기(_wating_view) + 빈 목록 colspan=7
- [ ] 라디오 checked 없음(quirk)·click→submit / 페이지네이션 param 검색조건 유지
- [ ] SEO(title 주문 내역/description 빈/author H2interactive/viewport)
