# 모바일 마이페이지 - 입금대기 내역 (mypage_order_wating)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_order_wating.html` (login_check, 파일명 오타 "wating" 유지) + 더보기 `mypage_order_wating_ajax.php`
- PC 대응: `screens/mypage-order-waiting`(`entities/mypage-order` `getMypageOrdersWaiting` — settle_no 그룹핑+가상계좌 상세). **모바일은 평면 재렌더**(그룹핑 무시, 은행계좌 미표시)
- 데이터: `Mypage2::getOrderList_vbank(page, step='1' AND status='3' AND m_no, order_item_id DESC)`

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_order_wating.html`(GET), title **"주문완료 내역"**(legacy quirk — 입금대기 화면인데 title이 주문완료). **세션 필수**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("주문완료 내역")`
- 본문 `#appCapsuleSub`: **검색폼 없음**(head `<style>` searchbox 있으나 body 검색박스 부재=dead) + `#order_list` 카드 반복 + 더보기 버튼
  - va_date 판정(원본 `DATE("YmdHis")>va_date`): 마감이면 "입금마감"/`bg-danger`, 아니면 "입금대기"/`bg-warning` → **백엔드 판정 `deposit_status`("closed"/"waiting") 재사용**(프론트 date 파싱 divergence 방지, PC 선례)
  - card-header: order_date substr 0~10 + 상세보기(`mypage_order_wating_view.html?settle_no=` — 상세뷰 미이관 단위)
  - card-body p-2 bg#191919:
    - delivery_type=="1": `span.badge.{deposit color}`(입금대기/입금마감)
    - delivery_type≠"1": `getOrderShipment` → `span.badge.bg-secondary`(getShipmentStatus, 미결제 대기라 보통 빈값)
    - product_name(`.mt-2.card-text`) + `.num` price+" 원"
  - card-footer[배송조회]: shipment 4·5·6이면 dead 버튼(미결제 대기 컨텍스트라 실질 미표시)
  - 더보기: `#btn_paging`(data-page/data-total, "( n / total ) 더보기") → AJAX page 증분 append, total==page면 alert "마지막페이지입니다"
- delivery_type=="1"과 ≠"1"은 상호배타(코드발송=입금 배지 / 택배=배송 배지)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "주문완료 내역", description/keywords 빈값
- head `<style>` searchbox dark(body 검색박스 없어 dead지만 legacy head 재현) — 미이식 무방하나 sibling(mypage_order) 동형 유지 위해 포함
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). screen server, 더보기 목록만 client

## 데이터 / API 계약
- **재사용(엔티티 증분 최소)**: `getMypageOrdersWaiting(page)`(grouped `GET /api/mypage/orders/waiting`, `WaitingOrder[]`) — 화면에서 order→item **평면화**(각 order_item 1카드). deposit_status/va_date는 order-level, delivery_type/product_name/price는 item-level
- **증분**: `WaitingOrderItem.shipment_status?: string | null` 추가(모바일 delivery_type≠1 배송 배지용, **PC 미사용·optional·additive**). 미결제 대기라 백엔드 통상 null
- mock 기존 재사용(`shared/mocks/fixtures/mypage-orders-waiting.ts`, handler totalPages:1)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_order_wating.html`
- 라우트: `app/m/mypage/mypage_order_wating.html/page.tsx`(server, requireMemberSession + getMypageOrdersWaiting(1) + flatten)
- screen: `screens/mobile-mypage-order-waiting`(server) — MobileSubHeader + `MobileMypageOrderWaitingList`(client 카드/더보기)
- lib: `screens/mobile-mypage-order-waiting/lib/flatten-waiting.ts`(`MobileWaitingCard` + `flattenWaitingOrders`) — 라우트/서버액션 공유
- 서버액션: `screens/mobile-mypage-order-waiting/api/load-more-waiting.ts`(page 증분 → flatten)
- 재사용: `entities/mypage-order`·`member-auth`·`widgets/mobile-sub-header`
- 데스크톱 폴백: `app/(pc)/mypage/mypage_order_wating.html`(PC ✅)

## 보존할 legacy quirk
- title "주문완료 내역"(입금대기 화면인데 주문완료 — 그대로)
- 파일명 오타 "wating" 유지
- 검색폼 없음(head searchbox style는 dead)
- 그룹핑 무시 평면 렌더(settle_no당 멀티아이템은 카드 여러 개, settle_no/deposit 반복)
- 은행계좌/예금주/금액 미표시(PC와 달리 배지+상품명+가격만)
- delivery_type≠1 배송 배지는 미결제라 통상 빈값·배송조회 dead

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·MobileSubHeader("주문완료 내역")·검색폼 없음
- [x] 입금대기(warning)/입금마감(danger) 배지 = deposit_status (delivery_type==1)
- [x] delivery_type≠1 배송 배지(bg-secondary, 통상 빈값) + 배송조회 dead(shipment 4~6)
- [x] 카드(날짜/상세보기 wating_view/상품명/₩)·평면화(멀티아이템 카드 분리)
- [x] 더보기 증분(total==page alert "마지막페이지입니다")
- [x] 하단 네비 표시·title/viewport/theme#000
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_order_wating)
