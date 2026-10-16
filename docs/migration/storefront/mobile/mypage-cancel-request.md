# 모바일 마이페이지 - 취소요청 내역 (mypage_cancel_request)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_cancel_request.html` (login_check) + 철회 `mypage_proc.php` mode=requestReturn
- PC 대응: `screens/mypage-cancel-request`(`entities/mypage-order` `getMypageCancelRequests`·`postRequestReturn`). **entity 재사용**(증분 없음)
- 데이터: `Mypage2::getOrderList_v2(page, (status='7' OR status='8') AND m_no, order_item_id DESC)`

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_cancel_request.html`(GET), title "취소 요청 내역". **세션 필수**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("취소 요청 내역")`
- 본문 `#appCapsuleSub`: **검색폼/더보기 없음**. 카드 반복만
  - card-header: order_date substr 0~10 + 상세보기(`mypage_order_view.html?settle_no=`)
  - card-body py-2: `.mb-1 > span.badge.bg-{status 8·9→danger:secondary}.font-12`(getOrderStatus(status)) + [delivery_type≠1: getShipmentStatus(shipment_status) **raw 텍스트**] + product_name + `.num` price+원
  - card-footer[배송조회]: shipment 4·5·6이면 `btn btn-primary btn-block "배송조회"`(**onclick 없음=dead**)
  - card-footer[요청철회]: status==8이면 `btn btn-primary btn-block "요청철회"` onclick requestReturn(settle_no, ordno)
  - bottom_menu + sidebar
- requestReturn: confirm(`주문번호 {ordno} 주문의 취소 요청을 철회하시겠습니까?`) → AJAX `mypage_proc.php {mode:requestReturn, settle_no, ordno}` → data.success → alert(message)+reload / else alert(message) / error alert(message)
- 날짜 필터: legacy WHERE 활성이나 form 없음(search input 미존재) → 파라미터 전달 경로 없음

## 배지/상태 라벨 (PC 재사용 로직)
- getOrderStatus: 1 주문대기/2 주문완료/3 배송준비/4 배송중/5 배송완료/6 구매확정/8 취소요청/9 취소완료/else ""
- shipment: 2 배송대기/3 배송준비/4 배송중/5 배송완료/6 구매확정/else ""

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "취소 요청 내역"
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). screen server, 요청철회만 client

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMypageCancelRequests(page)`(server-only, `GET /api/mypage/orders/cancel-requests`, {list, page, totalPages}) · `postRequestReturn({settle_no, ordno})`(`POST /api/mypage/orders/request-return`, {success, message}) · `requireMemberSession`
- mock 기존 재사용

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_cancel_request.html`
- 라우트: `app/m/mypage/mypage_cancel_request.html/page.tsx`(server, requireMemberSession + getMypageCancelRequests(1))
- screen: `screens/mobile-mypage-cancel-request`(server) — MobileSubHeader + 카드(배지/배송/철회/배송조회) + `MobileRequestReturnButton`(client, btn-block)
- 재사용: `entities/mypage-order`·`member-auth`·`widgets/mobile-sub-header`

## 보존할 legacy quirk
- 검색폼/더보기 없음(page 1만)
- 배송조회 버튼 dead(onclick 없음, shipment 4/5/6)
- 배송상태는 raw 텍스트(badge 아님)
- status 8·9 danger 배지

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·MobileSubHeader("취소 요청 내역")
- [x] 취소요청 카드(날짜/상세보기/getOrderStatus 배지/배송상태 텍스트/상품명/₩)
- [x] status==8 요청철회(confirm→AJAX→success reload/실패 alert)
- [x] shipment 4/5/6 배송조회 dead 버튼
- [x] 하단 네비 표시·title·검색폼/더보기 없음
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_cancel_request)
- 승인 시 확인(개발자 수용): getMypageCancelRequests·postRequestReturn 재사용·검색폼/더보기 없음·배송조회 dead 버튼·라벨맵 재현.
