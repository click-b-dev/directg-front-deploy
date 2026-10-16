# 사이트맵 (service / sitemap)

## 원본

- 파일: `pc/service/sitemap.html`
- 진입 URL: `/service/sitemap.html`
- 공통 include: `lib/lib.php`, `inc/header_common.html`, `inc/header.html`, `inc/footer.html`, `inc/footer_common.html`
- page title: `사이트맵`

## 화면·플로우

- Request: `GET /service/sitemap.html`
- GET/POST 파라미터 없음.
- 세션/권한 의존 없음. 공통 header의 로그인 상태 분기는 layout 단위에서 처리한다.
- 본문 구조: `.container` > `main.mb-5` > `h3.page-title...` + sitemap row 8개.
- 행 목록:
  - Header: 로그인/회원가입/마이페이지/장바구니/위시리스트 텍스트만 표시.
  - GNB: 서비스소개, 할인프로모션(진행중인 프로모션/타임딜), 이벤트, 공지사항, 이용안내 4종, 고객지원 3종.
  - 네비바: 플랫폼별, 장르별, 카테고리별, 한국어지원, 예약구매.
  - 퍼블리셔 - 전용: 2k, SEGA, CAPCOM, Paradox Interactive, PlayStation PC LLC, NEOWIZ.
  - 회원: 로그인, 로그아웃 텍스트, 회원가입 4단계, 비밀번호 재설정 텍스트.
  - 주문: 장바구니, 주문하기, 결제하기, 주문완료 - 입금대기, 주문완료 - 결제완료.
  - 마이페이지: 대시보드, 회원정보, 주문정보, 문의정보, 혜택정보.
  - Footer: 개인정보처리방침, 이용약관, 청소년보호정책, 환불정책, 사이트맵.

## Legacy quirk

1. Header 영역의 로그인/회원가입/마이페이지/장바구니/위시리스트는 링크가 아니라 `h5` 텍스트다.
2. 회원 영역의 로그아웃/비밀번호 재설정도 링크가 아니라 텍스트다.
3. 장르별 링크는 모두 `href="#"`다.
4. legacy와 실제 이관 URL이 다른 항목(`/mypage/account_update.html`, `/mypage/member_point.html`, `/mypage/mypage_event_gift.html`, `/order/order_ready.html`)도 sitemap 원문 링크를 그대로 유지한다.
5. 주석 처리된 할인 프로모션 전용 블록, 마이페이지 라이브러리, 제공콘텐츠 항목은 렌더하지 않는다.
6. `캐쥬얼`, `문의 하기`, `2k` 등 표기와 띄어쓰기는 원문 그대로 유지한다.

## 데이터

- DB/SQL/AJAX 없음.
- API 계약 없음 — 완전 정적 페이지.

## 타겟 매핑

- route: `apps/directg-client/src/app/service/sitemap.html/page.tsx`
- screen: `apps/directg-client/src/screens/service-sitemap`
- API/MSW/entity 없음.

## SSR·SEO

- legacy head: `<meta name="description" content="">`, `<title>사이트맵</title>`
- author/canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1`
- 공통 CSS/JS는 client layout의 legacy 자산 스택을 사용한다.

## Parity 체크리스트

- [ ] `/service/sitemap.html` 라우트가 렌더된다.
- [ ] 제목 `사이트맵`과 `page-title py-3 fw-bold mb-3 border-bottom` 클래스가 유지된다.
- [ ] 8개 행의 좌측 라벨과 우측 컬럼/링크 텍스트가 legacy와 일치한다.
- [ ] 링크 URL이 legacy 원문과 일치한다.
- [ ] 주석 처리된 항목이 렌더되지 않는다.
- [ ] API client/MSW/DB 의존이 없다.
