# 모바일(적응형) 서빙 기반

> 계획: `.omc/plans/mobile-adaptive-foundation-pilot.md`. 이 문서는 모바일 서빙 **기반**(미들웨어·레이아웃·자산)을 다룬다. 파일럿 화면은 `game-thumb.md`.

## 원본
- legacy `mobile/`(순수 PHP, 별도 docroot, 188 html + AJAX PHP). PC(`pc/`)와 완전 분리.
- 분기: `pc/lib/lib.php`·`mobile/index.php`의 User-Agent 정규식 감지 → 모바일 기기는 `https://m.directg.net/...`로 301 리다이렉트. `mobile/mgate.php`의 `$url_check` 화이트리스트가 PC URL ↔ 모바일 URL 매핑.
- 자산: `mobile/assets/`(css/js/images/img). CSS `style.css`·`dg_style.css`·`styleguide.css`(각 `?t=20251023`), JS `lib/bootstrap.min.js`·`lib/jquery-3.4.1.min.js`·`base.js`·`plugins/progressbar-js/progressbar.min.js`, 외부 ion-icons(`unpkg.com/ionicons@5.5.2`)·Material Icons(fonts.googleapis).
- `<html lang="ko">` + `<body class="dark-mode-active">`. viewport `width=device-width, ... maximum-scale=1, viewport-fit=cover` + `apple-mobile-web-app-*` + `theme-color #000`.

## 결정 (사용자 승인)
- **서빙**: 단일 도메인. `middleware.ts` UA 감지 → 모바일 요청을 `app/m/*`로 **내부 rewrite**(URL은 legacy `.html` 경로 그대로, 콘텐츠만 모바일). m. 서브도메인/301 모델 대신 채택.
- **자산**: 모바일 자산을 `public/mobile-assets/`로 **네임스페이스** 복사. 복사본 CSS/JS 내부 `/assets/...` 절대참조를 `/mobile-assets/...`로 치환(PC 자산 `public/assets/`와 충돌 회피 — 예: `css/styleguide.css`가 PC 10.4K vs 모바일 32.1K 동명 다내용). "무수정 복사" 원칙은 **경로 접두만** 예외(렌더 결과 동일).
- **커밋 분해**: ①자산복사 ②layout 분해+`(pc)` route group ③미들웨어 ④모바일 앱셸 ⑤파일럿 화면.

## 아키텍처
- `app/layout.tsx`(루트): `<html>`/`<body>` + 공유 폰트(Noto Sans KR) + 추적코드(GTM/gtag/Clarity) + `MswProvider`만. 미들웨어가 세팅한 `x-viewport` 헤더를 읽어 `<html data-bs-theme>`/`<body class>` 속성을 브랜치별 세팅.
- `app/(pc)/layout.tsx`: PC CSS(Bootstrap 5.3.5 CDN + `directg.css`/`custom.css`/`styleguide.css`) + `SiteHeader`/`SiteFooter` + `data-bs-theme="dark"`. 기존 PC 라우트 폴더를 `(pc)/`로 이동(route group → URL 불변).
- `app/m/layout.tsx`: 모바일 CSS 링크(`/mobile-assets/css/style.css` 등, Next `<head>` hoist) + ion-icons/Material Icons + `widgets/mobile-app-shell`(header/bottom/dialog). `<body class="dark-mode-active">`.

## 미들웨어 (UA 감지)
- legacy `mobile/index.php`(L5~19) 정규식 포팅:
  - 모바일 판정: `iPhone|iPod|iPad|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mni|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson|LG|SAMSUNG|Samsung` 매치.
  - (참고) `pc/lib/lib.php`는 별도 정규식 + 예외목록(`Macintosh|OpenBSD|...`) 사용. 구현은 legacy 동작 재현 목적의 단순 정규식 채택하되 대표 UA로 검증.
- 모바일 UA → `NextResponse.rewrite(new URL('/m' + pathname + search))` + 응답 헤더 `x-viewport: mobile`. PC는 통과 + `x-viewport: desktop`.
- `matcher`: `/mobile-assets`, `/assets`, `/_next`, `/api`, 파일 확장자 요청 제외.
- **범위 참고**: legacy `mgate.php` 화이트리스트(모바일 제공 페이지 목록)는 후속에 반영. 파일럿 단계에서는 `/game/game_thumb.html`만 `app/m`에 존재 → 미존재 경로는 404 대신 PC 폴백 여부를 후속 결정(파일럿은 game_thumb만 검증).

## Parity 체크리스트 (기반)
- [ ] 모바일 UA로 `/game/game_thumb.html` → 모바일 콘텐츠, URL 불변(rewrite)
- [ ] 데스크톱 UA로 기존 PC 라우트 렌더 불변
- [ ] 브랜치별 `<head>` CSS 분리, `<html>`/`<body>` 속성 분기
- [ ] `/mobile-assets/*` 404 없음
- [ ] `pnpm build:client` 성공
