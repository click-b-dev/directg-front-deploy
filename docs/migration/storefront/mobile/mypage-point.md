# 모바일 마이페이지 - 포인트 내역 (mypage_point)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_point.html` (login_check 세션 가드) + 증분 `ajax_point.php`
- PC 대응: `screens/mypage-point`(`entities/mypage-point` `getMypagePoints`). **entity 재사용**(증분 없음)
- 데이터: `Mypage::getPointList(page, m_no, regdt DESC)` + `getMemberEmoney`

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_point.html`(GET, page), title "포인트 내역". **세션 필수**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("포인트 내역")`
- 본문 `#appCapsuleSub > .section.pt-2.full`:
  - card: "고객님께서 보유하신 포인트는 {number_format(member_emoney)}원 입니다."
  - table(날짜/적립·사용/사유/포인트): 행 = regdt · (emoney_type "+"→적립/"-"→사용/그외 "") · memo(text-start) · `₩` + number_format(amt_delta)
    - 빈 목록: "적립금 내역이 없습니다."(colspan=6 quirk)
  - `input[type=button]#btn_more`: page>=total_pages면 "마지막 페이지"(btn-secondary), else "더보기"(btn-primary), data-page
- 더보기: `ajax_point.php {page:nextPage, page_num:10}` → 행 append. nextPage>=total_pages면 라벨 "마지막 페이지"+btn-secondary. **alert 없음**(notice와 차이)
- 페이지 `<style>`: `.won::before{content:"\20a9"}`(₩)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "포인트 내역"
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). 목록/더보기는 client(서버액션 증분)

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMypagePoints(page)`(`GET /api/mypage/points?page=N`, {member_emoney, list, page, totalPages}) + `requireMemberSession`
- 더보기: 서버액션 `loadMorePoints(nextPage)` → `getMypagePoints(nextPage).list`
- mock 기존 `mypage/points` 재사용

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_point.html`
- 라우트: `app/m/mypage/mypage_point.html/page.tsx`(server, requireMemberSession + getMypagePoints(1))
- screen: `screens/mobile-mypage-point`(server) — MobileSubHeader + emoney card + `MobileMypagePointList`(client, 표+더보기) + `api/load-more-points.ts`(서버액션)
- 재사용: `entities/mypage-point`·`member-auth`·`widgets/mobile-sub-header`

## 보존할 legacy quirk
- 빈 목록 colspan=6(열 4개인데 6)
- 더보기 버튼 라벨/클래스 토글(더보기 btn-primary ↔ 마지막 페이지 btn-secondary), alert 없음
- ₩ 접두(.won::before)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·MobileSubHeader("포인트 내역")
- [x] 보유 포인트 카드(원 콤마)
- [x] 표(날짜/적립·사용/사유/₩포인트)·빈목록 문구
- [x] 더보기 증분 append·라벨/클래스 토글(마지막 페이지)
- [x] 하단 네비 표시·title
- [x] middleware rewrite + 데스크톱 폴백(PC mypage_point)
- 승인 시 확인(개발자 수용): getMypagePoints 재사용·더보기 서버액션·빈목록 colspan=6·더보기 alert 없이 토글.
