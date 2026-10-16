# 모바일 마이페이지 - 주문완료 내역 (mypage_order)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_order.html` (login_check) + 증분 `mypage_order_ajax.php`
- PC 대응: `screens/mypage-order`(`entities/mypage-order` `getMypageOrders`). **entity 재사용**(증분 없음)
- 데이터: `Mypage2::getOrderList_v2(page, step='2' AND status='2' AND m_no, order_item_id DESC)` + `Order::getOrderShipment`/`getShipmentStatus`

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_order.html`(GET, page/search_goods_name), title "주문완료 내역". **세션 필수**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("주문완료 내역")`
- 본문 `#appCapsuleSub`:
  - 검색폼 `form.search-form[method=GET]`: `input[name=search_goods_name]`(placeholder "검색어를 입력해 주세요.") + search 아이콘. **날짜/연도 radio는 legacy 주석처리(미이관)**·WHERE의 날짜 필터도 주석(비활성)
  - `#order_list` 카드 반복: card-header(order_date substr 0~10 + 상세보기 `mypage_order_view.html?settle_no=`) + card-body(bg #191919): 배지[delivery_type 1·3 → is_actv "1"?구매확정:수령대기 / delivery_type≠1 → getShipmentStatus(shipment_status)] + product_name + `.num` price+원
  - `#btn_paging` 더보기: data-page/data-total, `mypage_order_ajax.php {page, search_product_name}` append. total==page → alert "마지막페이지입니다"
  - bottom_menu + sidebar(하단 네비 표시)
- 검색: GET 폼 제출 → `?search_goods_name=` 재조회(native)
- 페이지 `<style>`: `.searchbox .form-control{color:#dee2e6}`(dark)

## 배지/배송상태 (PC 재사용 로직)
- delivery_type 1 또는 3 → `is_actv=="1"?"구매확정":"수령대기"` (badge bg-secondary)
- delivery_type≠1 → shipment status 라벨(2 배송대기/3 배송준비/4 배송중/5 배송완료/6 구매확정/else "")
- (배송조회 버튼은 legacy 주석 → 미이관)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "주문완료 내역"
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). 검색폼 native GET(server), 카드/더보기 client. searchbox dark style

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMypageOrders(page, searchProductName)`(server-only, `GET /api/mypage/orders`, {list, page, totalPages}) + `requireMemberSession`
- 더보기: 서버액션 `loadMoreOrders(nextPage, searchProductName)`
- URL 파라미터는 legacy `search_goods_name` 유지, API는 PC `search_product_name`로 매핑
- mock 기존 `mypage/orders` 재사용

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_order.html`
- 라우트: `app/m/mypage/mypage_order.html/page.tsx`(server, requireMemberSession + getMypageOrders(1, search_goods_name))
- screen: `screens/mobile-mypage-order`(server) — MobileSubHeader + 검색폼(native GET) + `MobileMypageOrderList`(client 카드+배지+더보기) + `api/load-more-orders.ts`(서버액션)
- 재사용: `entities/mypage-order`·`member-auth`·`widgets/mobile-sub-header`

## 보존할 legacy quirk
- 날짜 필터/연도 radio 미이관(legacy 주석처리)
- 배송조회 버튼 미이관(주석)
- delivery_type=3은 배지 2개(구매확정/수령대기 + 배송상태)
- 더보기 total==page alert "마지막페이지입니다"

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·MobileSubHeader("주문완료 내역")·검색폼(search_goods_name GET)
- [x] 주문 카드(날짜/상세보기/배지/상품명/₩가격)·배지 파생(구매확정·수령대기·배송상태)
- [x] 더보기 증분 append·total==page alert
- [x] 하단 네비 표시·title·searchbox style
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_order)
- 승인 시 확인(개발자 수용): getMypageOrders 재사용·배송상태 라벨맵 재현·날짜/연도 radio·배송조회 버튼 미이관(legacy 주석)·상세보기 후속.
