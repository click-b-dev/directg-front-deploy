# DLC 상세 (dlc_view)

## 원본
- 파일: `pc/game/dlc_view.html` (745줄, 라이브 — game_view 기본게임/DLC 링크·검색 진입). `dlc_view_20251118.html`(백업)·`yjs_*` 제외.
- 참조: `docs/design-system/client.md`. 선례: game_view(`screens/game-detail`, `widgets/product-detail`).

## 화면·플로우
- 진입 URL: `/game/dlc_view.html?sku={goods_sku}` (sku만).
- 상태: `dlc_info.is_view=="Y" && dlc_info.status=="0"` → goods_status "Y", 아니면 "N"(alert "판매중인 상품이 아닙니다").
- 레이아웃: 2단 grid 812/460 (game_view 동일).
- **game_view와 차이**: 단일 옵션(DLC 1개). **cart/wishlist 버튼에 로그인 게이트 없음**(legacy JS가 data-login 검사 없이 직접 AJAX). 시스템요구사항 섹션 없음. 미디어는 스크린샷만(유튜브 없음), JS `media_type=="vidio"` 오타로 항상 img 스왑.

### content-left
1. 미디어(media_list[0].media_url 있을 때) — 스크린샷만, 썸네일 클릭 img 교체.
2. alert-warning 3종(고정): (a) "추가 콘텐츠(DLC) 안내 페이지... 전체 게임 정보는 [title_name](game_view?product_id={title_info.product_id})", (b) "플레이하려면 [{platform_name}]버전의 [title_name] 기본게임 필요", (c) `is_preorder_notice=="Y"`이면 "제품 코드(키) 발송은 추후 공지".
3. region_msg alert(있을 때, bg-danger).
4. DLC 단일 카드: 플랫폼 로고, promotion.sale_price>0이면 프로모션 종료일 바 + 프로모션 badge, 특전/예약구매 badge, 할인율(promotion.discount_rate>0→bg-danger, else discount>0→bg-primary), 소비자가 취소선(discount>0 || promotion.discount_rate>0), 판매가(promotion.sale_price>0 ? sale_price : price), wishlist/cart 버튼(**게이트 없음**, soldout=="N"이면 cart 아니면 품절).
5. 구성정보 상세(package_info>0): `ul.list-group-flush > li(unit_name)`.
6. 상세설명(`#description_html`): version=="2"→description_v2 raw, else `##`→`###` 치환 Parsedown. 전체보기 toggle(800).
7. Copyright(`#legal_text`): Parsedown(legal_text).

### content-right
1. 헤더 이미지: `{domain}/upload/product/{product_code}/header/header.jpg` + short_description.
2. 연령/등급: title_info.age_limit(10→age_all, else age_{n}) + game_rate 각 "1"→grade{i+1}.
3. 정보 dl: 출시일(dlc_info.release_date `date("Y년 m월 d일")`), 개발사/퍼블리셔(title_info), 언어지원(dlc_info spoken/interface/exclusive 인라인 badge — game_view와 마크업 약간 다름), 장르/카테고리(dlc_info genre/category getTagName).
4. steam_info: drm_notice / ext_user_account_notice → `alert alert-light`(있을 때).
5. 상품 정보 제공 고시: **legacy 버그** — `$goods_dlc_info`(오타, undefined)로 switch → platform_store_url/label 빈값 → 이용조건 링크 `<a href="" target="_blank"></a>` 빈 라벨. **verbatim 재현**. 환불정책 링크 `/service/refund_policy.php`(game_view는 `.html`, dlc는 `.php` — verbatim).

## SSR·SEO
- title=product_name, description=short_description, author=H2interactive, amazonbot noarchive.
- canonical/alternate(m): `dlc_view.html?sku={goods_sku}`.
- OG: title, video.movie, url, image=`{domain}/upload/product/{product_code}/header/header.jpg`, description, site_name.
- **GA4 view_item 없음**(header_common 공통 gtag만). **JSON-LD 없음**. viewport meta.

## 데이터 (legacy, 백엔드 책임)
- `Goods::getGoodsItemDetailSku($sku)` → dlc_info(+embedded promotion). status/is_view.
- `Goods::getTitleDetail($product_code)` → 부모 게임 title_info(product_id/title_name/developer/publisher/age_limit/game_rate).
- `Goods::getGoodsOptionDescription($product_code)` → short_description/description/version/description_v2/legal_text/region_msg.
- `Goods::getSteamAppInfo($steam_appid)` → drm_notice/ext_user_account_notice.
- `Goods::getGoodsItemScreenshotList($product_code)` → 스크린샷(num/url/thumbnail, image.directg.net remoteFileExist 체크 — 백엔드가 최종 URL 조립).
- `Goods::getGoodsOptionPackageInfo($product_code)` → 구성정보(unit_name[]).
- `Mypage2::getWishlistItem` → wishlist_chk(세션/쿠키).
- getTagName/getPlatform 해소.

### AJAX (order 도메인 이월)
- `.btn_cart` → POST `/order/cart_proc.php` {mode:add_cart, goods_sku} → #cart_result 주입 + #cart-modal(title "장바구니 안내"). **로그인 게이트 없음**.
- `.btn_wishlist` → POST `/order/wishlist_proc.php` {mode:add_wishlist, goods_sku} → #fail 없으면 아이콘 y + #wishlist-modal. **게이트 없음**.
- timer: `$goods_product_chk['promotion_end']` 미정의 → no-op.

## API 계약
### `GET /api/game/dlc-detail?sku={goods_sku}`
- 세션 쿠키 전달(wishlist_chk). 응답(JSON snake_case):
  - `goods_status`("Y"/"N"), `goods_status_msg`, `platform_name`, `is_preorder_notice`("Y"/"N"),
  - `dlc_info`: { product_code, product_name, product_name_en, goods_sku, domain, product_platform, is_bonus, is_preorder, soldout, consumer_price, price, discount, promotion:{sale_price,discount_rate,promotion_end}, release_date, spoken_korean, interface_korean, exclusive_korean, wishlist_chk },
  - `title_info`: { product_id, title_name, developer, publisher, age_limit, game_rate },
  - `goods_description`: { short_description, region_msg },
  - `description_html`, `legal_html`, `steam_info`:{drm_notice, ext_user_account_notice},
  - `media_list`: MediaItem[], `package_info`: [{unit_name}], `genre_names`:[], `category_names`:[].
  - 백엔드: setTitleHit 없음(dlc_view는 조회수 미증가), Parsedown/description_v2·remoteFileExist·getTagName·getPlatform·is_preorder_notice(time 비교) 처리.

## 타겟 매핑
- 라우트: `app/(pc)/game/dlc_view.html/page.tsx` — searchParams.sku, generateMetadata(동적).
- screen: `screens/game-dlc` (`GameDlcScreen`) — server 셸 + `widgets/product-detail`(MediaGallery·ToggleSection·WishlistButton/CartButton(게이트 없음)·CartWishlistModals(cartTitle="장바구니 안내")·PlatformLogo) + DLC 단일 카드 인라인.
- entity: `entities/dlc-detail` — `getDlcDetail(sku)`, `GET /api/game/dlc-detail`.
- mock: `fixtures/dlc-detail.ts` + handler. 비로그인(wishlist_chk="N").

## Parity 체크리스트
- [ ] sku 진입·is_view/status 분기
- [ ] alert 3종·region·DLC카드(가격/프로모션/버튼 게이트없음)·구성정보·상세설명 toggle·Copyright
- [ ] 우측 헤더/연령등급/정보dl/steam alert/상품고시(빈 링크 버그)
- [ ] SEO title/desc/canonical/alternate/OG/amazonbot, GA4·JSON-LD 없음
- [ ] 엣지: 미디어 없음, 품절, package 없음, steam_info 없음
