# 위시리스트 (mypage/wishlist)

## 원본
- 파일: `pc/mypage/mypage_wishlist.html` (+ `wishlist_proc.php`)
- 도메인 클래스: `Mypage2::getWishlist`/`getWishlistItem`/`deleteWishlist`, `Promotion::getPromotionGoodsPrice`, `Goods::getGoodsOptionTitleInfo`, `Order::addCart`
- 참조: `docs/design-system/client.md`, `ORDER-WORKFLOW-AUDIT.md`, `PROMOTION-EVENT-OPS.md`
- 선례: `entities/mypage-qna`(세션 목록), `ServerPagination`, 쿠폰(client mutation), `widgets/footer-banner-section`

## 화면·플로우
- 진입 URL: `/mypage/mypage_wishlist.html`, GET `?page=N`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > aside_mypage + `section#content.content.rounded-0.font-14`, main 뒤에 `footer_banner`(FooterBannerSection)
- 표 7열(colgroup 5/*/6/6/6/6/5%):
  1. 체크/삭제: status≠0 → 삭제 버튼 / soldout=Y → "품절" / else → 체크박스(name=idx, data-productcode/status/productname). thead에 chk_all
  2. 상품정보: `a[href=view_url][target=_blank]` product_name + is_promotion=Y면 "프로모션" badge
  3. 할인률: discount>0면 `badge {promotion_label} num ... minus` "{discount} %"
  4. 판매가: discount>0면 consumer_price 취소선(num won) + price(num text-white fw-bold won), number_format
  5. 판매상태: status 0→판매중 / 3→판매종료
  6. 저장일: reg_date substr(0,10)
  7. 비고: 삭제 버튼(btn_delete, data-idx)
- 빈 목록: "위시리스트에 등록된 상품이 없습니다." colspan=7
- 하단: `선택상품 삭제`(btn_select_delete) / `장바구니 이동`(btn_select_move_cart) + 페이지네이션(links_html, 정상)
- view_url(game_type 분기): game→`/game/game_view.html?product_id={title_sku}&sku={goods_sku}` / dlc→`/game/dlc_view.html?sku={goods_sku}`(+dlc_bundle면 `&platform={product_platform}`) / music→dlc_view / bundle→`/game/bundle_view.html?sku=` / accessories→`/game/goods_item_view.html?product_id={title_sku}&sku=` / holomodels→`/game/holomodels_view.html?product_id={title_sku}&sku=`(+holomodelsdlc면 holomodelsdlc_view `&platform=`)
- 프로모션가: `getPromotionGoodsPrice`가 sale_price>0면 price=sale_price·discount=discount_rate·is_promotion=Y·label=bg-danger, else data.price·data.discount·N·bg-primary
- 인터랙션(legacy jQuery):
  - chk_all → 전체 체크 토글
  - btn_delete(행) → confirm → POST wishlist_proc {mode:delete, idx} → alert(error_msg) + `location.href=mypage_wishlist.html`
  - btn_select_delete → 체크 idx 수집(0이면 alert) → confirm → {mode:select_delete, idx_arr} → alert + reload
  - btn_select_move_cart → 체크 항목 product_code 수집 → 비었으면 alert → confirm → {mode:cart_move, product_code_arr} → alert + confirm("장바구니로 이동?") → cart.html or wishlist.html
- 세션/권한: **로그인 필수**

## 데이터 (legacy)
- `getWishlist`: `SELECT a.idx,a.reg_date,a.product_code,a.product_name,b.consumer_price,b.price,b.is_view,b.status,b.soldout,b.goods_sku,b.game_type,b.display_type,b.product_platform,b.discount FROM tbl_wishlist a INNER JOIN tbl_goods_item b ON a.product_code=b.product_code WHERE a.m_no='{세션}' ORDER BY a.idx DESC` (20/page)
- per-item enrich: `getGoodsOptionTitleInfo(product_code)['sku']`(=title_sku), `getPromotionGoodsPrice(product_code)`(프로모션가)
- wishlist_proc: delete(`deleteWishlist`) / select_delete(idx_arr 순회 delete) / cart_move(getCart 중복확인→addCart→deleteWishlistGoodscode) / add_wishlist(주석=dead). **login_check 없음**(lib.php 세션만; m_no 사용)

## API 계약 (백엔드 전달)
- `GET /api/mypage/wishlist?page=N` (세션) → `{ list: WishlistItem[]; page; totalPages }`
  - `WishlistItem { idx, reg_date, product_code, product_name, consumer_price, price, discount, is_promotion, status, soldout, goods_sku, game_type, display_type, product_platform, title_sku }` — 백엔드가 프로모션가·title_sku 해석해 반환(프론트 N+1 없음)
- `POST /api/mypage/wishlist` (세션) — `{ mode: "delete"|"select_delete"|"cart_move", idx?, idx_arr?, product_code_arr? }` → `{ error_code, error_msg }`
  - 백엔드: delete/select_delete는 deleteWishlist, cart_move는 addCart+삭제(getCart 중복확인)
- 응답 타입: `entities/mypage-wishlist/model/types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_wishlist.html/page.tsx` → `/mypage/mypage_wishlist.html` (`requireMemberSession()`, getMypageWishlist deep import)
- screen: `screens/mypage-wishlist` (server) — aside + `<WishlistTable>`(client) + FooterBannerSection
- 컴포넌트: `screens/mypage-wishlist/ui/wishlist-table.tsx` (`'use client'`) — 표·체크박스·삭제/선택삭제/장바구니이동·view_url·프로모션가 표시
- entities: `entities/mypage-wishlist` (`getMypageWishlist` server, `postWishlistAction` client)
- 공용: `shared/ui/server-pagination`(baseUrl `/mypage/mypage_wishlist.html`)
- mock: `shared/mocks/fixtures/mypage-wishlist.ts` + handler `GET/POST */api/mypage/wishlist`

## 단위 경계 결정 / quirk
1. per-item enrich(title_sku·프로모션가)는 백엔드가 해석해 WishlistItem으로 반환(프론트 N+1 금지). 프론트는 view_url 조합만.
2. cart_move else 분기의 `goods_name.join`은 legacy 오타(product_name)이자 체크박스가 status=0에만 렌더돼 **도달 불가 dead branch** → 크래시 재현 대신 미도달 유지(문서화).
3. 삭제 후 `location.href=mypage_wishlist.html`, 선택삭제/이동 후 reload/이동 재현.
4. number_format→toLocaleString, `won`/`num`/`minus` 클래스·선행 공백 유지.
5. 페이지네이션 정상(변수 `$wish_list`) → ServerPagination.
6. footer_banner(FooterBannerSection) 포함.

## Parity 체크리스트
- [ ] aside(위시리스트) + 표 7열 + chk_all + 하단 버튼2 + 페이지네이션
- [ ] view_url game_type 분기 정확
- [ ] 프로모션 badge·할인률·판매가(취소선)·판매상태·저장일
- [ ] 삭제/선택삭제/장바구니이동 확인창·alert·이동
- [ ] 빈 목록 colspan=7 / SEO(title 위시리스트 내역/viewport/author H2interactive)
