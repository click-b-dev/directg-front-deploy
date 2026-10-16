# SSR 헤더 로그인 상태 + 로그아웃

> 이관된 SiteHeader가 세션 무관하게 비로그인 UI만 렌더하던 것을 legacy처럼 로그인/비로그인 분기로 보완.
> mypage 세션 인프라(`getMemberSession`) 재사용. 로그아웃 라우트 동반.

## 원본
- 파일: `pc/inc/header.html` (65~71행 세션 분기), 로그아웃 `pc/member/logout.php`
- 선행: `mypage/member-level-info.md`(세션 판독 인프라 확립)

## 화면·플로우 (legacy header.html 65~71)
- `$_SESSION['member']['m_id']` 있으면(로그인):
  - 로그아웃: `/member/logout.php` (logout-icon.svg + " 로그아웃")
  - 마이페이지: `/mypage/mypage_main.html` (`<i class="fa-solid fa-user me-2">` + 마이페이지)
- 없으면(비로그인):
  - 로그인: `/member/login.html` (login-icon.svg + 로그인)
  - 회원가입: `/member/join_step1.html` (`<i class="fa-solid fa-user-plus me-2">` + 회원가입)
- (공통, 분기 밖): 위시리스트, 장바구니
- **로그아웃**(`logout.php`): `session_destroy()` + `go("/index.php")` → 세션 파기 후 홈 이동

## 타겟 매핑
- `widgets/site-header`: `member?: MemberSession | null` prop 추가 → 로그인/비로그인 분기(서버 컴포넌트)
- `app/layout.tsx`: `getMemberSession()`을 Promise.all에 추가해 SiteHeader에 전달(전 페이지 헤더가 세션 반영)
- `app/member/logout.php/route.ts`: GET Route Handler — 세션 쿠키(`dg_member`) 삭제 + `/`로 redirect (legacy logout.php)
- entities: `getMemberSession`(mypage 단위에서 확립) 재사용

## API 계약 (백엔드 전달)
- `GET /api/member/session` (기존, member-level-info.md 계약) — 헤더도 이걸로 로그인 상태 판독
- `POST /api/member/logout` (백엔드) — httpOnly 세션 쿠키 파기. 프로덕션에선 logout 라우트가 이걸 호출해 쿠키 clear. **dev**는 라우트가 same-origin `dg_member` 쿠키를 직접 삭제(mock 쿠키는 비httpOnly)

## 유의
- 로그아웃 링크 target `/member/logout.php`는 이번에 라우트로 동작(dev: 쿠키 삭제+redirect). 마이페이지 링크 `/mypage/mypage_main.html`은 미이관→404(점진).
- layout에 세션 SSR fetch 추가 → 헤더가 매 요청 세션 반영(legacy PHP 세션과 동일).

## Parity 체크리스트
- [ ] 로그인 상태 → 로그아웃/마이페이지, 비로그인 → 로그인/회원가입
- [ ] 아이콘·href·텍스트(로그아웃 앞 공백 포함) 일치
- [ ] 위시리스트/장바구니 공통 유지
- [ ] 로그아웃 → 쿠키 삭제 + 홈 이동, 이후 헤더 비로그인 전환
