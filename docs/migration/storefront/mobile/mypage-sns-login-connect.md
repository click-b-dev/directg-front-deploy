# 모바일 마이페이지 - 간편로그인 연결 (sns_login_connect)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/sns_login_connect.html` (login_check 세션 가드)
- PC 대응: `screens/mypage-sns-login-connect`(`entities/mypage-sns-login`). **entity 전부 재사용**(증분 없음)
- 데이터: `Member::getMemberSnsLogin(m_no)`(연결된 provider만)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/sns_login_connect.html`(GET), title "간편로그인 연결". **세션 필수**
- `<body class="bg-white ...">` 흰 배경
- 헤더: `inc/sub_header.html` → `MobileSubHeader("간편로그인 연결")`
- 본문 `#appCapsuleSub.mt-0`(style padding-top:56px) > `.section.full.mt-2 > .wide-block`:
  - PAYCO/KAKAO/NAVER 각 `.table-responsive.mb-3 > table.table-dark.table-bordered.font-14`: thead colspan=2 "{TYPE} 간편로그인" + tbody
    - 연결됨: 계정연결(`btn btn-sm btn-light` "X 연결해제")·연결상태("연결됨.")·연결일자(sns_connect_date), tr.table-active
    - 미연결: 계정연결(`btn btn-sm btn-light` "+ 계정연결")
  - bottom_menu + sidebar(하단 네비 표시)
- connect: 버튼 클릭 → `/api/{provider}/{provider}_login.php {mode:{provider}_connect}` → 팝업. openSnsConnectPopup 재사용(팝업명 PC connect_* — 모바일 login_*과 미세 차이, 게이트 명시)
- disconnect: PAYCO → `payco_disconnect.php` raw "0"→reload/else alert / KAKAO·NAVER → `{provider}_disconnect.php` {code,msg}: alert(msg), code=="0"→reload

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "간편로그인 연결"
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). connect/disconnect는 client. bg-white body(라우트 style)

## 데이터 / API 계약
- **재사용(증분 없음)**: `getSnsLoginConnections`(server-only, `GET /api/mypage/sns/connections`) + `postSnsConnectUrl`/`openSnsConnectPopup`·`postPaycoDisconnect`({result})·`postSnsDisconnect`({code,msg}) + `requireMemberSession`
- mock 기존 재사용

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/sns_login_connect.html`
- 라우트: `app/m/mypage/sns_login_connect.html/page.tsx`(server, requireMemberSession + getSnsLoginConnections, body bg-white style)
- screen: `screens/mobile-mypage-sns-login-connect`(client) — MobileSubHeader + normalizeRows(PAYCO/KAKAO/NAVER) 3테이블 + connect(openSnsConnectPopup)/disconnect(postPaycoDisconnect·postSnsDisconnect)
- 재사용: `entities/mypage-sns-login`·`member-auth`·`widgets/mobile-sub-header`

## 보존할 legacy quirk
- disconnect/connect 버튼 `btn-light`(PC는 disconnect btn-danger — 모바일은 둘 다 light)
- payco disconnect raw "0"·kakao/naver {code,msg}
- connect 팝업명 login_*(모바일)↔connect_*(PC 재사용) 미세 차이
- body bg-white

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·MobileSubHeader("간편로그인 연결")·bg-white
- [x] 3 provider 테이블(연결됨: 연결해제+상태+일자 / 미연결: 계정연결)
- [x] connect 팝업·disconnect(payco "0"/kakao·naver {code,msg}) reload/alert
- [x] 하단 네비 표시·title
- [x] middleware rewrite + 데스크톱 폴백(PC sns_login_connect)
- 승인 시 확인(개발자 수용): entities/mypage-sns-login 전부 재사용·connect 팝업명 PC connect_*(모바일 login_*과 미세 차이)·disconnect 버튼 btn-light.
