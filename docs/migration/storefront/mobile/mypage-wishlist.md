# 모바일 마이페이지 - 위시리스트 (mypage_wishlist)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_wishlist.html` (login_check) + `wishlist_proc.php`
- PC 대응: `screens/mypage-wishlist`(`entities/mypage-wishlist`). **entity 재사용 + age_limit 증분**
- 데이터: `Mypage2::getWishlist(page, a.m_no=세션, a.idx DESC)` + per-item `getGoodsOptionTitleInfo`(title_sku)·`Promotion::getPromotionGoodsPrice`(프로모션가) + `getMemberInfo`(birth_day/is_auth → 나이)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_wishlist.html`(GET), title "위시리스트 내역". **세션 필수**
- 헤더: **커스텀** `appHeader bg-primary text-light`(goBack chevron, sub_header 아님)
- 본문 `#appCapsuleSub`: 카드(`card cart-item`) 반복 — **테이블 아님, 페이지네이션/chk_all 없음**(page 1만)
  - **연령 게이팅**: `age_limit>17 && age_limit>age` → **체크박스 숨김** + detail에 "{age_limit}세 이용가" 표기. 그 외 체크박스(idx, data-status/productcode/productname)
  - `a[href=view_url][target=_self]`: game_type 분기(game/dlc(+dlc_bundle platform)/music→dlc/bundle/accessories/holomodels(+holomodelsdlc platform))
  - 상품명 h3 + detail(status 0 판매중/3 판매종료 + 연령표기 + is_promotion "프로모션" badge)
  - 가격블록: discount>0 할인률 badge(프로모션 bg-danger/일반 bg-primary, minus) + consumer_price 취소선 + price
  - `cart-item-footer`: 삭제 버튼(btn_delete, data-idx) — **연령 무관 항상 표시**
  - 목록 끝: total==0 → "위시리스트에 등록된 상품이 없습니다."(text-center) / else → 선택상품 삭제 + 장바구니 이동 버튼
- 나이 계산(PHP): is_auth=="Y"면 birth_day 6자리(yymmdd, date('y') 세기판정)/8자리(yyyymmdd 앞4) → 연도차, 월/일 보정 주석(미적용). is_auth≠Y면 age=0
- 뮤테이션(wishlist_proc):
  - btn_delete: confirm("선택하신 상품을 삭제하시겠습니까?") → {mode:delete, idx} → alert(error_msg) + `location.href="mypage_wishlist.html"`(상대)
  - btn_select_delete: 체크 idx 수집(0이면 "삭제할 상품을 선택해 주세요.") → confirm → {mode:select_delete, idx_arr} → alert + `location.href="mypage_wishlist.html"`
  - btn_select_move_cart: 체크 항목 순회 — status≠0면 product_name push+flag=false+**해제**, else product_code push. flag면 (product_code 0이면 "장바구니로 이동할 상품을 선택해 주세요.") confirm → {mode:cart_move, product_code_arr} → alert → confirm("장바구니로 이동하시겠습니까?") → `/order/cart.html` or `/mypage/mypage_wishlist.html`. **flag=false면 "{names}은(는) 판매중인 상품이 아닙니다."** (모바일은 체크박스가 status 무관 렌더 → 이 분기 **도달 가능**, PC와 다름)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "위시리스트 내역", description/keywords 빈값
- head `<style>` form-check-label ::before/::after 보정 + cart-item CSS(대부분 주석) → 미이식(체크박스 위치 보정만 유효하나 style.css 기반, 이식 생략 판단)
- 앱셸: 커스텀 헤더 + `/m/layout` bottom-nav/sidebar(표시) + bootstrap.min.js. screen **client**(폼/뮤테이션)

## 데이터 / API 계약
- **재사용**: `getMypageWishlist(page)`(`GET /api/mypage/wishlist`, `WishlistItem[]`)·`postWishlistAction`(`POST /api/mypage/wishlist`)·`getMemberAccount`(birth_day/is_auth)·`requireMemberSession`
- **증분**: `WishlistItem.age_limit: number` 추가(tbl_goods_item.age_limit, 연령 게이팅용, **PC 미사용**) + fixture에 age_limit(19/15/0)
- mock 기존 재사용

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_wishlist.html`
- 라우트: `app/m/mypage/mypage_wishlist.html/page.tsx`(server, requireMemberSession + getMemberAccount + getMypageWishlist(1) + computeMemberAge)
- screen: `screens/mobile-mypage-wishlist`(**client**) — 커스텀 헤더 + 카드 + 연령 게이팅 + 3 뮤테이션
- lib: `screens/mobile-mypage-wishlist/lib/compute-age.ts`(`computeMemberAge`)
- 재사용: `entities/mypage-wishlist`·`entities/mypage-account`·`member-auth`
- 데스크톱 폴백: `app/(pc)/mypage/mypage_wishlist.html`(PC ✅)

## 보존할 legacy quirk
- 커스텀 bg-primary 헤더(sub_header 아님)
- 페이지네이션/chk_all 없음(page 1만, PC와 다름)
- 연령 게이팅(체크박스 숨김 + "N세 이용가"), 삭제 버튼은 항상 표시
- 체크박스가 status 무관 렌더 → move_cart "판매중 아님" 분기 도달 가능(PC는 dead)
- 삭제/선택삭제 후 상대경로 `mypage_wishlist.html`, move_cart는 절대경로 이동
- view_url `target=_self`(PC는 _blank)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·커스텀 헤더("위시리스트 내역")·카드형·페이지네이션 없음
- [x] 연령 게이팅(age_limit>17 && >age → 체크박스 숨김 + "N세 이용가")
- [x] view_url game_type 분기·프로모션 badge·할인률·판매가(취소선)·판매상태
- [x] 삭제(confirm→상대이동)/선택삭제(빈선택 alert)/장바구니이동(판매중검사 분기 포함)
- [x] 빈 목록 메시지·하단 버튼2(비어있지 않을 때)
- [x] 하단 네비 표시·title/viewport/theme#000
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_wishlist)
