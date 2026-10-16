# 장바구니 (cart.html)

order 영역 첫 단위. 로그인 세션 전제(쿠키 포워딩 — mypage 선례). 결제(PG)는 후순위 하드 게이트.

## 원본
- 파일: `pc/order/cart.html`(564줄, 라이브 — `yjs_cart.html`·`test_cart.html`은 대체/테스트본 제외), AJAX `pc/order/cart_proc.php`(376줄)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`, `BUSINESS-RULES.md`

## 화면·플로우
- 진입 URL: `/order/cart.html` (파라미터 없음). 로그인 필수(`login_check.php`) → 비로그인 `/member/login.html` redirect(= `requireMemberSession()`).
- 데이터: `Order::getCartList($_SESSION['member']['m_no'])` (선택여부 selected 포함).
- 화면 요소:
  - 주문 step nav 4단(01 장바구니 active bg-primary / 02 주문하기 / 03 결제하기 / 04 주문완료) — 정적
  - 유의사항 alert `cart_msg bg-alert` — li 6개(환불/가격변동/7일취소/수량제한/이벤트예약단품/최대20개) 정적 verbatim
  - 장바구니 테이블 `#order_table`: caption "장바구니 상품수 ( {전체건수}/20 )", thead(전체선택 체크박스 / 삭제 / 상품정보 / 가격정보)
    - 빈 목록: "장바구니가 비었습니다." (colspan 4)
    - 행: ① 체크박스(name `goods_sku[]`, value goods_sku, `selected=="1"`이면 checked, data-productname) ② 삭제 버튼(`btn_cart_del`, data-sku/productname, fa-trash) ③ 상품카드(이미지 `/upload/product/{product_code}/header/header.jpg` + 타입 badge + 플랫폼 아이콘 + 배송 badge + 상품명 h5 + 프로모션/예약/특전 badge) ④ 가격(프로모션/상시할인/정가 분기)
  - `선택 상품 삭제` 버튼(`btn_select_del`) — 폼 내부
  - 합계 박스: 총 주문수량(`#total_goods_count`=선택건수) 개 / 총 주문금액(`#total_price`) 원
  - `쇼핑 계속하기`(핸들러 없음=inert) / `주문하기`(`btn_select_order`) 버튼
  - footer_banner include (main 내부)
- 타입 badge(상품카드): game/basic 기본게임(bg-info)·game/edition 에디션(bg-primary)·game/multi 멀티팩(bg-warning)·dlc DLC(bg-content)·music Music(bg-content)·bundle 번들(bg-success)·holomodels(본체 bg-success/DLC bg-content/에디션 bg-primary). **PC 표준 색(bg-info 등), 모바일 bg-c* 아님.** 모두 `rounded-0 font-12 py-2`(holomodels는 fw-bold).
- 플랫폼 아이콘: product_platform 1 steam.svg / 34 epic_w.svg / 35 rockstar_2.svg / 51 holomodels.svg(w-75) — `/assets/images/platform/`(기존재).
- 배송 badge: delivery_type 1 코드발송(badge-outline-success) / 2 택배발송(badge-outline-post) / 3 코드+택배발송(badge-outline-code-post), `font-11 fw-500`.
- 가격 분기(price cell):
  - `is_array(promotion)` → bg-danger `{promotion.discount_rate} %` + `<s>consumer_price</s>` + promotion.sale_price
  - elif `discount>0` → bg-primary `{discount} %` + `<s>consumer_price</s>` + price
  - else → price만
- view_url(행 상품명/이미지 링크, target _blank): product_type=="retail" → `goods_item_view.html?product_id={title_sku}&sku={goods_sku}`; else game→`game_view?product_id={title_sku}&sku={goods_sku}` / dlc·music→`dlc_view?sku={goods_sku}` / bundle→`bundle_view?sku={goods_sku}` / holomodels→`holomodels_view?product_id={title_sku}&sku={goods_sku}`(display_type holomodelsdlc면 `holomodelsdlc_view?sku={goods_sku}&platform=`).

### 인터랙션 (cart_proc.php AJAX, 페이지 JS)
- 체크박스 change: 체크→`mode=cart_item_select`, 해제→`mode=cart_item_deselect` (goods_sku) AJAX로 **선택상태 서버 영속화** + `getOrderPrice()` 합계 재계산(클라이언트).
- 전체선택(`#cart_chk_all`): 각 체크박스 checked 설정 후 `.trigger('change')` → 항목마다 select/deselect 발생.
- 개별 삭제(`btn_cart_del`): confirm("해당 상품을 장바구니에서 삭제하시겠습니까?") → `mode=del_cart` → gtag `remove_from_cart` → `location.reload()`.
- 선택 삭제(`btn_select_del`): 체크된 sku 수집 → confirm("선택한 상품을 장바구니에서 삭제하시겠습니까?") → `mode=select_del_cart`(goods_sku_arr) → gtag → reload.
- 주문하기(`btn_select_order`): total_price==0 → alert("구매할 상품을 선택해 주세요.") return; else gtag `begin_checkout` + `#orderFrm.submit()` (**POST → order.html**, 체크된 goods_sku[] 전송).
- getOrderPrice(): 체크된 행의 `.price[data]` 합 → `#total_price`, 체크 수 → `#total_goods_count`.
- gtag `view_cart`(ready 시 cart_list 항목).

### 폼 필드/검증
- `#orderFrm`(method POST, action `order.html`): 체크박스 `goods_sku[]`. 별도 검증 없음(주문하기 시 total_price==0만 alert).

### 분기/리다이렉트
- 비로그인 → `/member/login.html`(login_check).
- **test 계정**(`m_id=="test@h2int.com"`) → `test_cart.html` redirect. **미이관(테스트 경로)** — 개발자 확인 필요, 일반 회원 무관.
- 리셀러(mem_type=R)·특정 IP → `sleep(20/40)` 매크로 방지 지연. **백엔드 책임**(프론트 무관).

### 세션/권한 의존
- `$_SESSION['member']['m_no']` — 쿠키 포워딩(백엔드 세션 소유), `requireMemberSession()` 가드. mypage 선례.

## SSR·SEO
- head: `<title>장바구니</title>`, `<meta name=description content="">`(빈값), `<meta name=author content="">`(빈값), viewport `width=device-width, initial-scale=1.0`. canonical/OG/구조화데이터 **없음**.
- 로그인 게이트 페이지(robots meta 없음 — legacy 그대로).
- 페이지 전용 CSS: 없음(`<style>` 빈 블록). 공통 자산(Bootstrap/directg.css)만.
- SSR: 목록/합계 초기 렌더는 서버(getCartList). 체크박스/삭제/합계재계산/주문submit은 CSR.

## 데이터 (legacy)
- `Order::getCartList(m_no)`: `tbl_cart`⋈상품, 회원 장바구니 목록 + selected. 항목: product_code, goods_sku, product_name, product_type(retail 등), game_type, display_type, product_platform, delivery_type, is_preorder, is_bonus, consumer_price, price, discount, promotion(배열: discount_rate/sale_price), selected("1"/"0").
- `getGoodsOptionTitleInfo(product_code)['sku']` = title_sku(view_url용). 백엔드 enrich.
- cart_proc modes: add_cart(상품페이지 진입점 — **본 단위 밖**, 계약만), cart_item_select/deselect, del_cart, select_del_cart. add_cart는 수량제한(memberPurchaseLimitChk)·재고(runAssetStock)·연령/본인인증(isAuthAdult/isAuthSelf)·중복 검증 후 addCart.

## 결제(PG)
- 해당 없음(cart 단위). 주문하기 → order.html(다음 단위)로 폼 POST만.

## API 계약 (백엔드 전달)

### `GET /api/order/cart` — 장바구니 목록 (쿠키 세션)
- 응답: `{ "list": CartItem[] }`
- 백엔드: `getCartList(세션 m_no)`. 프로모션가·title_sku enrich. 비로그인 401 → 프론트 `/member/login.html` redirect.

### `POST /api/order/cart` — 장바구니 액션 (cart_proc.php)
- 요청: `{ mode, goods_sku?, goods_sku_arr? }`
  - `mode="cart_item_select"|"cart_item_deselect"` (goods_sku) — 선택상태 영속화(setCartItemSelect/Deselect, price 재계산 저장)
  - `mode="del_cart"` (goods_sku) — 단건 삭제(deleteCart)
  - `mode="select_del_cart"` (goods_sku_arr) — 다건 삭제
  - `mode="add_cart"` (goods_sku) — **본 단위 밖**(상품페이지 트리거). 수량제한/재고/연령·본인인증/중복 검증. 에러 문자열 verbatim("장바구니는 최대 20개…", "해당 상품은 품절되었습니다.", 성인/본인인증 안내 등)
- 응답: legacy는 HTML 조각/빈 응답. 프론트는 액션 성공 여부만 필요 → `{ error_code?, error_msg? }`(성공 시 무시, reload). select/deselect는 응답 무시(fire-and-forget).
- 에러 문자열(add_cart) 원문 유지는 백엔드 책임.

### CartItem 타입 → `entities/cart/model/types.ts`

## 타겟 매핑
- 라우트: `app/(pc)/order/cart.html/page.tsx` (server, `requireMemberSession()` + `getCart()` 쿠키포워딩 + metadata title "장바구니")
- screen: `screens/order-cart` — `order-cart-screen.tsx`(server 셸: container>main + step nav + alert + `<CartContent>` + FooterBannerSection) + `cart-content.tsx`(client: 폼/테이블/합계/버튼/gtag)
- entities: `entities/cart`(`getCart` 쿠키포워딩 GET, `postCartAction` client POST, CartItem 타입)
- widgets: `FooterBannerSection` 재사용
- mock: `shared/mocks/fixtures/cart.ts` + handler `GET/POST /api/order/cart`

### 구현 노트(idiomatic 차이)
- 가격 span의 legacy `data="{n}"`(비표준 속성, jQuery getOrderPrice 훅)는 **생략** — 합계를 React 상태에서 직접 계산(동작 동일). 클래스명(`num won consumer_price price`)은 유지.
- 전체선택은 legacy처럼 항목별 select/deselect 뮤테이션 발생(선택상태 영속화 parity).
- `쇼핑 계속하기`는 legacy에 핸들러 없음 → inert 버튼 그대로.

## Parity 체크리스트
- [ ] step nav 4단(01 active) / 유의사항 6줄 / caption 건수(/20)
- [ ] 행: 체크박스(selected 초기값)·삭제버튼·상품카드(이미지/타입badge/플랫폼/배송badge/상품명/프로모션·예약·특전)·가격(프로모션/상시할인/정가 분기)
- [ ] view_url 분기(retail/game/dlc/music/bundle/holomodels)
- [ ] 빈 목록 "장바구니가 비었습니다."
- [ ] 체크박스 select/deselect 뮤테이션 + 합계 재계산 / 전체선택 / 단건·선택 삭제(confirm→reload) / 주문하기(0원 alert·begin_checkout·order.html POST)
- [ ] gtag view_cart/remove_from_cart/begin_checkout
- [ ] SEO: title "장바구니", 빈 description, viewport / canonical·OG 없음
- [ ] 합계=선택 항목 기준(count/sellPrice)

## 보류/후속
- `order.html`(주문서) — 다음 단위(주문하기 POST 목적지).
- add_cart(상품페이지 담기 버튼 wiring: game_view/timedeal 등 이월분) — 별도 단위(cart_proc add_cart 계약은 본 문서에 기술).
- wishlist_proc(위시 AJAX)는 mypage-wishlist에서 이미 처리.
- 결제(settle+PG) — 하드 게이트 후속.
