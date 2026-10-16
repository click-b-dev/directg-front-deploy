# 주문서 (order.html)

order 영역 2번째 단위(02 주문하기). cart "주문하기" POST 목적지. 로그인 세션 전제(쿠키 포워딩). 결제(settle.html/PG)는 다음 하드 게이트.

## 원본
- 파일: `pc/order/order.html`(787줄, 라이브 — `yjs_order*`·`old_order*`·`test_order*` 제외)
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, `PAYMENT-APPROVAL.md`

## 화면·플로우
- 진입 URL: `/order/order.html`. cart.html `#orderFrm`(method POST)의 action. **단, POST body(goods_sku[])는 읽지 않음** — `getOrderItemList($_SESSION m_no)`로 세션 선택항목 재조회(cart_item_select로 영속된 selected). 로그인 필수(`login_check.php`).
- 주문상품 0건 → `go(cart.html)` redirect.
- 데이터: `Order::getOrderItemList(m_no)`(선택항목), `Member::getMemberEmoney(m_no)`(**dgkr DB** 포인트), `Mypage::getMemberAddress(m_no)`(배송지).
- `is_delivery_address`: 항목 중 delivery_type 2·3(실물) 있으면 true → 배송지 섹션 노출.
- 화면 요소:
  - step nav 4단(02 주문하기 active bg-primary)
  - 유의사항 `alert-light` li 4개(주문실수/7일취소/수량제한/포인트 3000원↑100원단위) verbatim
  - `#orderFrm`(POST → **settle.html**): hidden `enc_str`(빈값)·`member_emoney`·`emoney_chk`
  - 주문상품정보 표: caption "상품수 ( 총 N 개 )", 행마다 hidden `goods_sku[]` + 상품카드(이미지/타입badge/플랫폼PNG로고/배송badge/상품명/음성한국어·프로모션·예약·특전 badge) + 가격(프로모션 bg-danger / 상시할인 bg-primary / 정가)
  - 배송지(실물 시): 우편번호(readonly)+검색btn, 주소(readonly), 상세주소, 주문자이름, 휴대폰번호, 배송요청메세지 — `getMemberAddress` prefill
  - 포인트 사용(total_price>=3000 시): use_emoney input, 사용/사용안함 btn, 보유포인트
  - 결제수단 radio: **toss·naverpay·payco·SC0060(휴대폰)·SC0040(가상계좌)** 라이브. (toss_bank·SC0010 카드·SC0030 계좌이체는 **HTML 주석**=미노출)
  - 가격요약(sticky #price-summary): 총상품가격(consumer 합)·총할인(consumer-total)·포인트사용(숨김→JS)·총결제금액(total_amount data-total=total_price)
  - 청약 재확인 popover(전자상거래법 8조2항), is_agree 체크(required), 주문하기 submit
- **타입 badge 색(order 고유, cart와 다름 verbatim)**: game/basic→bg-primary·edition→bg-info·multi→bg-warning / dlc·music→bg-content / bundle→bg-success / holomodels(본체 success·dlc content·edition primary). game·dlc·music·bundle=`rounded-0 font-12 py-2`, holomodels=`fw-bold`.
- **플랫폼 아이콘(order 고유)**: 1 `Platform_logo_steam.png`(w-50) / 34 `Platform_logo_epic.png` / 35 `Platform_logo_rockstar.png` / 51 `holomodels.svg` — cart의 svg와 다름.

### 클라이언트 로직(JS)
- `set_real_settle_price(checkEmoney)`(초기 0·포인트 사용/취소 시): total_amount = total_price − emoney 표시 갱신 → **결제수단 radio 전체 uncheck** → real_settle 가격대별 disable:
  - 라이브 radio별 활성 임계값(가격대 사다리 동치): **toss ≥300 · naverpay ≥100 · payco ≥100 · SC0060 ≥350 · SC0040 ≥10000** (미노출 toss_bank≥200·SC0010≥1000·SC0030≥10000).
- 포인트 사용(`btn_point_use`): use_emoney 입력값 검증 — 보유<1000 alert("보유한 포인트가 1000원 이상시 사용가능합니다.")·초기화 / 100원 단위 floor / 결제금액 초과→결제금액으로 cap / 보유 초과→alert("보유포인트보다 많은…")·초기화. 성공 시 emoney_chk=Y, input readonly, 포인트사용 display show, 재계산.
- 포인트 사용안함(`btn_point_cancel`): emoney_chk=N, use_emoney 0, readonly 해제, display hide, 재계산(0).
- use_emoney Enter(keyup 13) → `check_use_emoney()` — **legacy에 미정의 함수(ReferenceError, 사실상 no-op) = 버그**. 이관 시 Enter no-op 재현.
- 우편번호 검색(`btn_zipcode`) → daum postcode(kakao cdn) → zipcode/address 채움, address2 focus. → `shared/lib/daum-postcode` `openDaumPostcode()` 재사용.
- buyr_tel2 input: 전화번호 포맷(02/지역/휴대폰 하이픈).
- submit(실물 시): zipcode 빈값 alert("주소를 입력하셔야 합니다.")+focus / address 빈값 동일. → 통과 시 settle.html POST.
- 청약 popover: `new bootstrap.Popover` (data-bs-toggle popover).

### 폼 필드/검증
- POST(settle.html): enc_str(빈), member_emoney, emoney_chk(Y/N), use_emoney, goods_sku[](항목), settle_kind(required radio), is_agree(required), [실물] zipcode/address/address2/buyr_name/buyr_tel2/msg.
- HTML5 required: settle_kind, is_agree. JS: 실물 zipcode/address 비어있으면 차단.

### 분기/리다이렉트
- 비로그인 → `/member/login.html`(login_check). 주문항목 0 → cart.html.

### 세션/권한 의존
- `$_SESSION['member']['m_no']` — 쿠키 포워딩(백엔드 세션 소유), `requireMemberSession()` 가드. 포인트는 dgkr DB.

## SSR·SEO
- head: `<title>주문하기</title>`, description/author 빈값, viewport `width=device-width, initial-scale=1.0`. `Cache-Control: no-cache`(동적 SSR — Next 기본 동적). canonical/OG/구조화데이터 없음. 로그인 게이트.
- 페이지 인라인 style: `#price-summary{top:480px}`, `.bg-table-head{background:#303D4E}`.
- SSR: 항목/가격요약/배송지 prefill은 서버. 포인트/결제수단/제출은 CSR.

## 데이터 (legacy)
- `getOrderItemList(m_no)`: 선택(selected=1) 장바구니 항목. 필드: product_code, goods_sku, product_name, game_type, display_type, product_platform, delivery_type, spoken_korean, is_preorder, is_bonus, consumer_price, price, discount, promotion({discount_rate,sale_price}|null). (cart 대비 spoken_korean 추가·view_url/selected 없음)
- `getMemberEmoney(m_no)`(dgkr): 보유 포인트(number).
- `getMemberAddress(m_no)`: MemberAddress(name/zipcode/address/address_detail/phone/message) — mypage-address와 동일.

## 결제(PG)
- order.html은 결제수단 **선택 + settle.html POST**까지. 실제 PG 예약/승인은 settle.html + `pc/api/<pg>/`(다음 하드 게이트). order.html 자체는 PG API 호출 없음.

## API 계약 (백엔드 전달)

### `GET /api/order/checkout` — 주문서 데이터 (쿠키 세션)
- 응답: `{ "items": OrderItem[], "member_emoney": number, "member_address": MemberAddress, "is_delivery_address": boolean }`
- 백엔드: getOrderItemList(세션 m_no, selected=1) + getMemberEmoney(dgkr) + getMemberAddress. 프로모션가 enrich. 항목 0건이면 프론트가 cart.html redirect. is_delivery_address = 실물(2/3) 포함 여부.

### settle.html POST (다음 단위 — 계약 예고)
- order.html은 native form POST(enc_str/member_emoney/emoney_chk/use_emoney/goods_sku[]/settle_kind/is_agree/[배송지])로 settle.html에 전달. settle 계약은 결제 단위에서 확정.

### OrderItem 타입 → `entities/order/model/types.ts` (MemberAddress는 `@entities/mypage-address` 재사용)

## 타겟 매핑
- 라우트: `app/(pc)/order/order.html/page.tsx` (server, `requireMemberSession` + `getOrderCheckout` 쿠키포워딩 + 항목0 redirect(`/order/cart.html`) + metadata "주문하기")
- screen: `screens/order-order` — `order-order-screen.tsx`(server 셸: step nav 02·유의사항·`<OrderForm>`·footer_banner + 인라인 style) + `order-form.tsx`(client: 항목표/배송지/포인트/결제수단/요약/제출/daum/popover)
- entities: `entities/order`(`getOrderCheckout` 쿠키포워딩, OrderItem 타입). `MemberAddress`는 mypage-address 재사용. `openDaumPostcode` 재사용.
- widgets: `FooterBannerSection` 재사용
- mock: `shared/mocks/fixtures/order-checkout.ts` + handler `GET /api/order/checkout`

### 구현 노트(idiomatic)
- 결제수단 disable는 legacy 가격대 사다리를 radio별 임계값(toss≥300 등)으로 재현(동치, 미노출 radio 제외).
- 포인트 재계산 시 radio 전체 uncheck는 selectedSettle state 초기화로 재현.
- use_emoney Enter는 legacy 미정의 함수 버그 → no-op 재현.
- 가격 span의 `data-total`은 유지(총결제금액 base), 나머지 합계는 state 계산.

## Parity 체크리스트
- [ ] step nav(02 active)·유의사항 4줄
- [ ] 항목표: 타입badge(order 색)·플랫폼PNG·배송badge·음성한국어/프로모션/예약/특전·가격 분기·hidden goods_sku[]
- [ ] 배송지: 실물 포함 시만 노출·prefill·우편번호검색(daum)·전화포맷·제출 검증(빈 zipcode/address alert)
- [ ] 포인트: total_price>=3000 시만·사용 검증(1000미만/100단위/cap/초과)·사용안함·재계산·display
- [ ] 결제수단: 5종 라이브·가격대별 disable(임계값)·포인트변경 시 uncheck·required
- [ ] 가격요약: 총상품가격/총할인/포인트사용(숨김)/총결제금액(=total_price−emoney)
- [ ] is_agree required·청약 popover·주문하기 settle.html POST
- [ ] SEO: title "주문하기", 빈 desc, viewport / canonical·OG 없음
- [ ] 항목0 → cart.html redirect
- [ ] number_format(콤마)

## 보류/후속
- **settle.html + PG(kcp/toss/naver/payco/kakao)**: 하드 게이트, 다음 단위. order.html submit은 settle.html 라우트 부재 시 405/404(예상).
- add_cart(상품페이지 담기 wiring) — 별도 단위.
- toss_bank·SC0010·SC0030 결제수단은 legacy 주석=미이관(주석 상태 유지).
