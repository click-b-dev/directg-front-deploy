# 모바일 장바구니 (cart)

order 도메인 첫 모바일 단위. PC `order-cart`가 이미 이관 완료 → `entities/cart` 재사용(증분 0). 결제(PG)는 후속 하드 게이트.

## 원본 (legacy mobile)
- 파일: `mobile/order/cart.html`(364줄, 라이브 — `cart_dev.html`·`test_cart.html`·`yjs_cart.html`은 dev/test본 제외), AJAX `mobile/order/cart_proc.php`
- PC 대응 단위: `docs/migration/storefront/order/cart.md` (재사용 출처)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/order/cart.html` (파라미터 없음). 로그인 필수(`login_check.php`) → 비로그인 redirect = `requireMemberSession()`.
- 데이터: `Order::getCartList($_SESSION['member']['m_no'])` (선택여부 selected 포함) — PC와 동일 데이터.
- 화면 요소 / 마크업 조각:
  - **인라인 커스텀 헤더**(`inc/sub_header.html` include 아님): `appHeader bg-primary text-light mt-0` — 좌 goBack(chevron-back) + pageTitle "장바구니" + 우 **검색토글만**(`toggle-searchbox`, search_icon_white.svg). **장바구니 아이콘 없음**(현재 장바구니 화면) → `MobileSubHeader`와 다름(그것은 우측에 검색+장바구니 2개).
  - `#search` 컴포넌트: `<form method=GET action="/game/game_search.html">` (**PC/`MobileSubHeader`의 `game_search_thumb.html`이 아니라 `game_search.html`** — 한국어지원 변형, **미이관=후속**. 마크업만 verbatim).
  - `#DialogClear` Bootstrap 모달: **dead**(영문 "Empty Cart"/"All items will be deleted", CLOSE/DELETE 모두 `data-bs-dismiss`만, 여는 트리거 없음). Mobilekit 템플릿 잔재 → verbatim 유지(비활성).
  - `#appCapsuleSub.full-height > .section.pt-2`:
    - 빈 목록: `<div class="text-center font-16 mt-5">장바구니가 비었습니다.</div>` (폼/합계/버튼 없음)
    - `<p class="mb-1">장바구니 상품수 ( {전체건수}/20 )</p>` (전체 건수, count)
    - `#orderFrm`(form, POST → `order.html`): 항목 카드 반복
      - `.card.cart-item.mb-2.rounded-0`
        - `.card-header.bg-secondary`: 체크박스(`goods_sku[]`, value goods_sku, `selected=="1"`→checked, data-productname) + 삭제 버튼(`btn_cart_del`, data-sku/productname, `bi bi-trash-fill`)
        - `img.card-img-top` (이미지 `{domain}/upload/product/{product_code}/header/header.jpg` — **PC는 상대경로 `/upload/product/...`, mobile은 domain 접두**. 전체 이관 자산 관행=상대경로 → domain 생략, PC 동일)
        - `.card-body`: `h5.card-title` product_name + `.card-text` 가격 분기
      - 합계 `.section.mt-2.mb-5 > .card > ul.listview.flush.transparent.simple-listview`: 총 상품 가격(`#total_goods_price` won) / 총 할인(`#total_discount_price` text-danger **m-won**) / 총 결제 금액(`#total_price` fw-bold won)
      - `#btn-order-wrap`(**position:fixed bottom:56px**, 하단바 위): `#btn_select_order` "주문하기" btn-primary btn-lg btn-block
- **PC와 차이(모바일 단순화)**: step nav 4단·유의사항 alert·전체선택(cart_chk_all)·선택삭제(btn_select_del/select_del_cart)·쇼핑계속하기 버튼·타입/플랫폼/배송/예약/특전 badge·상품 view_url 링크 **전부 없음**. 카드형(PC는 table). 합계 3줄(상품가/할인/결제, PC는 주문수량/주문금액).
- 가격 분기(`.card-text`):
  - `is_array(promotion)` → `badge bg-danger`(discount_rate %) + `strong.price.won`(sale_price) + `s.consumer_price.won`(consumer_price)
  - elif `discount>0` → `badge bg-primary`(discount %) + `strong.price.won`(price) + `s.consumer_price.won`(consumer_price)
  - else(정가) → `strong.price.won`(price) 만
  - **quirk**: else 분기 `<s>` 열기 태그는 `if(discount>0)` 안, `</s>` 닫기는 밖 → 정가 항목엔 stray `</s>`만 남음(브라우저 무시=렌더 무효). JSX에선 정가일 때 `<strong>`만 렌더(등가).

## 폼 필드/검증
- `#orderFrm`(POST `order.html`): 체크박스 `goods_sku[]`. 검증 없음(주문하기 시 total_price==0만 alert).
- **action `order.html`**: 상대경로 → 브라우저 URL `/order/cart.html` 기준 `/order/order.html`. **order.html 미이관=다음 단위** → verbatim 유지(현재는 폴백/404, 문서화).

## 분기/리다이렉트
- 비로그인 → login redirect(`requireMemberSession()`).
- **PC의 test 계정→test_cart.html, 리셀러 sleep 지연** — 모바일 cart.html엔 없음(단순). 무관.

## 세션/권한 의존
- `$_SESSION['member']['m_no']` — 쿠키 포워딩(백엔드 세션 소유), `requireMemberSession()` 가드. mypage 선례.

## 인터랙션 (cart_proc.php AJAX, 페이지 JS)
- 체크박스 change: 체크→`mode=cart_item_select` / 해제→`mode=cart_item_deselect` (goods_sku) AJAX **선택상태 서버 영속화**(응답 무시) + `getOrderPrice()` 합계 재계산(클라이언트).
- 개별 삭제(`btn_cart_del`): confirm("해당 상품을 장바구니에서 삭제하시겠습니까?") → `mode=del_cart` → gtag `remove_from_cart` → `location.reload()`.
- 주문하기(`btn_select_order`): total_price==0 → alert("구매할 상품을 선택해 주세요.") return; else gtag `begin_checkout` + `#orderFrm.submit()`(POST → order.html, 체크된 goods_sku[]).
- `getOrderPrice()`: 체크된 `.cart-item`마다 `price=.price[data]`, `consumer=.consumer_price[data]`(없으면 0→price). total_goods_price+=consumer / total_discount+=(consumer-price) / total_price+=price.
- gtag `view_cart`(ready 시 **전체** cart_list 항목).
- **PC에만 있는 전체선택/선택삭제(select_del_cart)는 모바일에 없음** → 미사용 모드.

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`, `theme-color #000`, mobile-web-app-capable/apple-status-bar black-translucent.
- metadata: title "장바구니", description ""(빈값), keywords ""(빈값). canonical/OG 없음.
- 사용 앱셸: **커스텀 인라인 헤더**(MobileSubHeader 아님) + `#search` + dead `#DialogClear` / bottom-nav = `app/m/layout.tsx` 전역(cart는 **하단바 표시**, 숨김 style 없음) / sidebar = 전역.
- 페이지 전용 `<style>`: `.form-check-input{width:1.5rem;height:1.5rem}` + `#btn-order-wrap{position:fixed;bottom:56px;...}` → verbatim 이식.

## 데이터
- 재사용 엔티티: `entities/cart` (`getCart` 쿠키포워딩 GET, `postCartAction` client POST, `CartItem` 타입). **증분 0**.
- 모바일 사용 필드(subset): goods_sku, product_name, product_code, consumer_price, price, discount, promotion, selected. (title_sku/product_type/game_type/display_type/product_platform/delivery_type/is_preorder/is_bonus는 모바일 미사용 — view_url·badge 없음.)
- 모바일 전용 동작(증분/AJAX): **없음**. PC와 동일 3모드 중 subset(cart_item_select/deselect/del_cart) 사용, select_del_cart 미사용, add_cart는 상품페이지 트리거로 본 단위 밖.

## API 계약 (증분만, 백엔드 전달)
- **증분 없음**. `GET /api/order/cart` · `POST /api/order/cart`(mode cart_item_select/deselect/del_cart) 모두 PC cart 단위에서 계약 완료(`docs/migration/storefront/order/cart.md`). mock `shared/mocks/fixtures/cart.ts` + handler 재사용.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `/order/cart.html`
- 라우트: `app/m/order/cart.html/page.tsx`(server, `requireMemberSession()` + `getCart()` → items, viewport theme#000 / metadata title "장바구니")
- screen: `screens/mobile-order-cart`(**client** 풀스크린 — wishlist 선례: 커스텀 헤더 + `card cart-item` + client 뮤테이션/gtag). 커스텀 헤더(goBack+검색토글+#search+dead #DialogClear) + `#appCapsuleSub.full-height` + 빈/목록 분기 + 합계 + fixed 주문버튼.
- 재사용 entities: `entities/cart`(getCart/postCartAction/CartItem)
- 신규 UI: 없음(카드 인라인, 별도 entity UI 승격 불필요)
- mock: 재사용(`cartFixture`)

## Parity 체크리스트 (모바일 UA)
- [ ] 커스텀 헤더(goBack/검색토글, 장바구니 아이콘 없음) · #search(action=game_search.html) · dead #DialogClear
- [ ] 화면 요소: count `( n/20 )` · card(체크박스 selected 초기값/삭제버튼 bi-trash-fill/이미지/product_name/가격분기) · 합계 3줄 · fixed 주문버튼
- [ ] 가격 분기(프로모션 bg-danger / 상시할인 bg-primary / 정가) + 정가 stray `</s>` 무효 등가
- [ ] 빈 목록 "장바구니가 비었습니다."(폼/합계/버튼 미렌더)
- [ ] 체크박스 select/deselect 뮤테이션(fire-and-forget) + 합계 재계산(상품가/할인/결제)
- [ ] 개별 삭제(confirm→del_cart→gtag remove_from_cart→reload)
- [ ] 주문하기(0원 alert / begin_checkout gtag / order.html POST)
- [ ] gtag view_cart(전체 항목) on mount
- [ ] 모바일 head/viewport(theme#000) · title "장바구니"
- [ ] middleware rewrite(모바일 UA `/order/cart.html`→`/m/...`) / 데스크톱 UA PC 유지
- [ ] 하단바 표시(숨김 없음)

## 보류/후속
- `order.html`(주문서, POST 목적지) — **다음 order 단위**(현재 action verbatim, 미이관).
- `game_search.html`(검색 폼 목적지, 한국어지원 변형) — 후속(마크업만 verbatim).
- add_cart(상품페이지 담기 버튼 wiring) — 별도 단위(계약은 PC cart 문서).
- 결제(settle+PG) — 하드 게이트 후속.
