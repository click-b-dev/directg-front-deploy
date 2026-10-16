# 모바일 마이페이지 - 쿠폰 내역 (mypage_coupon)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_coupon.html` (login_check) + 등록 `mypage_coupon_proc.php` + 증분 `ajax_coupon.php`
- PC 대응: `screens/mypage-coupon`(`entities/mypage-coupon` `getMypageCoupons`·`postCouponRegister`). **entity 재사용**(증분 없음)
- 데이터: `Mypage::getCouponList(page, m_no, regdt DESC)`

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_coupon.html`(GET, page), title "쿠폰 내역". **세션 필수**
- 헤더: **커스텀** `appHeader.bg-primary.text-light` goBack + "쿠폰 내역"(sub_header 아님, point와 차이)
- 본문 `#appCapsuleSub > .section.pt-2.full`:
  - `.section-title` "쿠폰등록" + `form#coupon_form`(POST mypage_coupon_proc.php): 쿠폰번호 input(coupon_number) + 쿠폰등록 submit
  - `.section-title` "쿠폰내역" + table(등록일/사유/포인트): regdt · coupon_name(text-start) · ₩+number_format(coupon_price). 빈목록 "쿠폰 내역이 없습니다."(colspan=6)
  - `input#btn_more`: page>=total면 "마지막 페이지"(secondary) else "더보기"(primary), data-page
- 쿠폰등록 제출: `coupon_number.trim()` regex `/^(([a-zA-z0-9]{4})-?){4}$/gm`(A-z 오타 quirk) 불일치 → alert "인증번호의 길이를 확인해주세요." → AJAX `mypage_coupon_proc.php {coupon_number}` → `data=="성공"`(PC {result:"성공"}) → alert "포인트가 지급되었습니다. 자세한 내역은 마이페이지 > 포인트 에서 확인 가능합니다." + `location.reload()` / else alert(data) / error alert "오류"
- 더보기: `ajax_coupon.php {page:nextPage, page_num:10}` → 행 append + 라벨/클래스 토글(마지막 페이지, alert 없음)
- 페이지 `<style>`: `.won::before{content:"\20a9"}`(₩)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "쿠폰 내역"
- 앱셸: 인라인 bg-primary 헤더 + `/m/layout` bottom-nav/sidebar(표시). 등록/목록/더보기 client. goBack base.js

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMypageCoupons(page)`(`GET /api/mypage/coupons?page=N`, {list, page, totalPages}) · `postCouponRegister(couponNumber)`(`POST /api/mypage/coupon`, {result}) · `requireMemberSession`
- 더보기: 서버액션 `loadMoreCoupons(nextPage)`
- mock 기존 `mypage/coupons`·`mypage/coupon` 재사용

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_coupon.html`
- 라우트: `app/m/mypage/mypage_coupon.html/page.tsx`(server, requireMemberSession + getMypageCoupons(1))
- screen: `screens/mobile-mypage-coupon`(client) — 인라인 헤더 + 쿠폰등록 폼(regex+register) + 쿠폰내역 표 + 더보기 + `api/load-more-coupons.ts`(서버액션)
- 재사용: `entities/mypage-coupon`·`member-auth`

## 보존할 legacy quirk
- 커스텀 bg-primary 헤더(point와 달리 sub_header 아님)
- regex `[a-zA-z0-9]` A-z 오타 verbatim
- 빈목록 colspan=6(열 3개)
- 등록 성공 시 location.reload()
- 더보기 alert 없이 토글·₩ 접두

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·커스텀 헤더(bg-primary goBack "쿠폰 내역")
- [x] 쿠폰등록 폼(번호 입력+등록, regex 검증, 성공 reload/실패 alert)
- [x] 쿠폰내역 표(등록일/사유/₩포인트)·빈목록·더보기 증분
- [x] 하단 네비 표시·title
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_coupon)
- 승인 시 확인(개발자 수용): getMypageCoupons·postCouponRegister 재사용·regex A-z 오타 verbatim·빈목록 colspan=6·성공 reload.
