# 마이페이지 — 회원등급 안내 (member_level_info) + 세션/가드 인프라 + aside_mypage

> 마이페이지 도메인 **첫 단위**. 23개 mypage 페이지 공통 인프라를 함께 확립:
> - **SSR 세션 판독** `getMemberSession()` — 요청 쿠키를 `GET /api/member/session`에 전달(httpOnly 쿠키 기반)
> - **로그인 가드** `requireMemberSession()` — legacy `login_check.php`, 비로그인 시 `/member/login.html` redirect
> - **`widgets/mypage-aside`** — aside_mypage 그룹형(회원정보/주문정보/문의정보/혜택정보)
> 개발자 결정: 첫 페이지=member_level_info(최소·정적), dev 세션=**쿠키 게이트**(로그인 mock 쿠키 → SSR 전달 → session mock 판독, 미로그인 → 가드 redirect)

## 원본
- 파일: `pc/mypage/member_level_info.html` (라이브), 가드 `pc/lib/login_check.php`, aside `pc/inc/aside_mypage.html`
- 참조: `../legacy-project/docs/MEMBER-LIFECYCLE.md`, `docs/design-system/client.md`

## 화면·플로우
- 진입 URL: `/mypage/member_level_info.html` (GET, **로그인 필요**)
- 가드: `$_SESSION['member']['m_id']` 없으면 login.html redirect
- 레이아웃(`container my-3 pb-5 > main.d-grid (240px auto)`): aside_mypage + `section#content.content.rounded-0.font-14`
  - aside "마이페이지" 4그룹(각 `<hr class="my-0">` 구분), active=회원등급 안내(`text-primary fw-bold`)
  - 본문: `h3`(legacy 태그버그 `<h3>…</h2>` → 렌더상 h3) "※ 회원 등급별 혜택 안내" + 표(일반 0%/정회원 1%/VIP 3%) + 안내 문단 4개
- 데이터/폼: 없음(정적 표). 세션은 가드에만 사용(본문은 회원정보 미사용)

## SSR·SEO (legacy)
- `<title>회원등급 안내</title>`, description 빈값, **keywords 빈 meta**(존재), **author 없음**
- viewport `width=device-width, initial-scale=1, shrink-to-fit=no` (**shrink-to-fit=no는 deprecated·현대 브라우저 무시** → viewport export는 width+initialScale, shrink-to-fit 생략(무영향))
- canonical/OG 없음. 렌더: 정적 → 서버 컴포넌트(가드도 서버)

## 데이터/계약 (백엔드 전달)
### `GET /api/member/session`
- 쿠키 기반 현재 회원 반환. 응답 `{ member: MemberSession | null }` (MemberSession = `$_SESSION['member']` 필드)
- 백엔드: httpOnly 세션 쿠키 판독 → 회원 or null. 비로그인 → `{member:null}`
- 프론트: `getMemberSession()`이 요청 쿠키를 전달해 호출, `requireMemberSession()`이 null이면 redirect

## 타겟 매핑
- 라우트: `app/mypage/member_level_info.html/page.tsx` (서버 — `requireMemberSession()` 가드 후 렌더)
- screen: `screens/mypage-member-level-info` (서버 컴포넌트, 정적)
- widget: `widgets/mypage-aside`(신규 그룹형, active prop)
- entities: `entities/member-auth` `getMemberSession`(api)·`requireMemberSession`(lib) — **server-only, 메인 barrel 미노출**(client 컴포넌트 안전)
- mock: `GET /api/member/session`(쿠키 `dg_member` 있으면 mock 회원, 없으면 null) + `member-session` fixture

## Parity 체크리스트
- [ ] 미로그인 → login.html redirect / 로그인(쿠키) → 페이지 렌더
- [ ] aside_mypage 4그룹·hr·active(회원등급) 일치
- [ ] 240px 그리드 레이아웃·section 클래스
- [ ] 표(등급/기준/포인트)·안내 문단 일치
- [ ] SEO(title/keywords 빈meta/viewport) 일치, author 없음
