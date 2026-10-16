# 모바일 마이페이지 - 대시보드 (mypage_main)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_main.html` (login_check 세션 가드)
- PC 대응: `screens/mypage-main`(`entities/mypage-dashboard` `getMypageDashboard` + `requireMemberSession`). **전부 재사용**(증분 없음)
- 데이터: `Mypage::getMemberEmoney(m_no)` + `Mypage2::getOrderItemCount(m_no,'2')`(주문) / `('9')`(취소)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_main.html`(GET), title "마이페이지". **세션 필수**(login_check → 비로그인 시 로그인 이동)
- 헤더: `inc/sub_header.html` → `MobileSubHeader("마이페이지")`(검색토글/뒤로/장바구니)
- 본문 `#appCapsuleSub`:
  - `.section.pt-2 > .profile-head`: `<h3 class="name">{name} <small>님 환영합니다.</small></h3>`
  - `.section.full.mt-2 > .profile-stats`: 5개 `<a href="#" class="item">` — 보유 포인트(member_emoney)·총 주문건수(order_info.cc)·총 주문금액(order_info.ss)·총 취소건수(cancel_info.cc)·총 취소금액(cancel_info.ss), 각 number_format
  - `.section.full.mb-2`: listview 4그룹
    - 회원정보: 계정 설정(`/mypage/account_settings.html`)·간편로그인 연결(`/mypage/sns_login_connect.html`)·회원등급 안내(`/mypage/member_level_info.html`)
    - 주문정보: 입금대기(`mypage_order_wating.html`)·주문완료(`mypage_order.html`)·취소요청(`mypage_cancel_request.html`)·취소완료(`mypage_cancel_end.html`)·위시리스트(`mypage_wishlist.html`)
    - 고객센터: 문의 내역(`mypage_qna.html`)·문의 하기(`mypage_qna_register.html`)
    - 혜택정보: 제공컨텐츠(`mypage_supply_content.html`)·포인트(`mypage_point.html`)·쿠폰(`mypage_coupon.html`)·사은품(`mypage_gift.html`)
  - bottom_menu + sidebar 포함(하단 네비 표시)
- 인터랙션: 링크만(정적). MobileSubHeader가 검색토글 담당

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "마이페이지"
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). screen은 server 컴포넌트(정적 본문)

## 데이터 / API 계약
- **재사용(증분 없음)**: `requireMemberSession`(세션/이름/가드) + `getMypageDashboard`(`GET /api/mypage/dashboard`, member_emoney·order_info{cc,ss}·cancel_info{cc,ss}). 모바일은 order_list/cancel_list/point_list 미사용(집계만)
- mock 기존 `mypage/dashboard` 재사용

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_main.html`
- 라우트: `app/m/mypage/mypage_main.html/page.tsx`(server, requireMemberSession + getMypageDashboard → prop)
- screen: `screens/mobile-mypage-main`(server) — `MobileSubHeader` + profile-head(name) + profile-stats(5 집계) + listview 4그룹
- 재사용: `entities/mypage-dashboard`·`member-auth`(requireMemberSession)·`widgets/mobile-sub-header`

## 보존할 legacy quirk
- profile-stats item href="#"(dead 링크)
- number_format(천단위 콤마) — toLocaleString

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드(비로그인→로그인 이동)
- [x] MobileSubHeader("마이페이지")·profile-head(name 님 환영합니다)
- [x] profile-stats 5개(emoney/주문 cc·ss/취소 cc·ss) 콤마 포맷
- [x] listview 4그룹 14링크(경로)
- [x] 하단 네비 표시·title
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_main)
- 승인 시 확인(개발자 수용): getMypageDashboard·requireMemberSession 재사용(집계만, order_list 등 미사용)·profile-stats href=# dead 유지.
