# 모바일 마이페이지 - 제공컨텐츠 (mypage_supply_content)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/mypage_supply_content.html` (라이브 — `mypage_main.html:168`에서 링크, 변형 파일 없음) + login_check
- PC 대응: `docs/migration/storefront/mypage/supply-content.md` (`screens/mypage-supply-content`, `entities/mypage-supply-content`)
- **모바일은 PC와 전혀 다름**: PC는 실제 제공콘텐츠 목록을 렌더하지만, **모바일은 목록 없이 "PC에서 확인" 안내 메시지만 표시하는 stub**. 데이터 조회 없음(PDO 연결만 열고 미사용=dead code).

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/mypage_supply_content.html`(GET), title "제공컨텐츠". **세션 필수(login_check)**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("제공컨텐츠")`
- 본문 `#appCapsuleSub` > `section full` > div > `section-title mt-2` "제공컨텐츠" + `section` > `<h3>제공콘텐츠는 PC 환경에서 확인해 주시기 바랍니다.</h3>`
- **데이터 없음 / 폼 없음 / 인터랙션 없음 / 페이지네이션 없음**
- 세션/권한: 로그인 필수(가드만, 콘텐츠는 정적)

## 보존할 legacy 표기 불일치 (그대로 재현)
- title / section-title: "제공**컨**텐츠" (컨텐츠)
- 안내 메시지: "제공**콘**텐츠는 PC 환경에서 확인해 주시기 바랍니다." (콘텐츠)
- → legacy 원문의 컨/콘 혼용을 **수정하지 않고 그대로** 옮긴다.

## 모바일 head / 앱셸
- viewport device-width scale 1 고정 viewport-fit cover, theme #000, apple-web-app capable/black-translucent, title "제공컨텐츠", description/keywords 빈값
- 앱셸: `MobileSubHeader("제공컨텐츠")` + `/m/layout` bottom-nav/sidebar(표시). screen **server**(정적, 인터랙션 없음)
- 페이지별 mobile-assets CSS: 없음

## 데이터 / API 계약
- **없음**. 데이터 조회·뮤테이션 전무. `requireMemberSession`만 재사용. 엔티티/계약/증분/mock 모두 불필요.

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/mypage_supply_content.html`
- 라우트: `app/m/mypage/mypage_supply_content.html/page.tsx`(server, requireMemberSession 가드만)
- screen: `screens/mobile-mypage-supply-content`(server) — MobileSubHeader + section-title + 안내 h3
- 재사용: `member-auth`(requireMemberSession). 신규 UI 없음, mock 없음

## Parity 체크리스트 (모바일 UA)
- [ ] 세션 가드(비로그인 → /member/login.html)
- [ ] MobileSubHeader("제공컨텐츠") + section-title "제공컨텐츠"
- [ ] 안내 메시지 h3 "제공콘텐츠는 PC 환경에서 확인해 주시기 바랍니다."(콘텐츠 표기)
- [ ] 데이터/폼/인터랙션 없음
- [ ] 모바일 head/viewport/theme #000/title · 하단 네비 표시
- [ ] middleware rewrite + 데스크톱 폴백(PC mypage_supply_content)
