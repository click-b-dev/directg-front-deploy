# 로그인 (회원)

> 회원 인증 도메인의 **첫 단위**. 세션 방식·범위·hCaptcha·보일러플레이트 처리는 개발자 게이트에서 확정:
> - 세션: **백엔드 httpOnly 세션 쿠키** (legacy PHP `$_SESSION['member']` 재현). 프론트는 로그인 API 호출, 쿠키는 백엔드가 `Set-Cookie`.
> - 범위: 로그인 페이지(이메일/비번 + SNS 간편로그인 **엔트리**). SNS OAuth 콜백·계정연결·가입(`join_step*`)은 member/join 후속 단위.
> - hCaptcha: MSW 개발 단계 **stub**(우회), 실제 site key/secret은 백엔드 연동 시.
> - start-kit auth 보일러플레이트: directg 전용 교체(이 단위에서 login skeleton 제거).

## 원본
- 파일: `pc/member/login.html` (라이브 — `old_login.html`은 구버전), 처리 `pc/member/login_proc.php`
- 세션 가드: `pc/lib/login_check.php`, 로그아웃: `pc/member/logout.php`
- SNS: `pc/api/{naver,kakao,payco}/*_login.php`
- 참조 문서: `../legacy-project/docs/MEMBER-LIFECYCLE.md`, `docs/design-system/client.md`

## 화면·플로우
- 진입 URL: `/member/login.html` (GET). `return_url` = `HTTP_REFERER`가 `https://directg.net` 포함 시 그 값, 아니면 ""
- 화면 요소:
  - "기존회원 로그인": `form#memberFrm` (POST action=`login_proc.php`)
    - hidden `return_url`
    - `input#m_id` (type=email, name=m_id, placeholder "아이디(이메일)", required, autocomplete off)
    - `input#m_pwd` (type=password, name=m_pwd, placeholder "비밀번호", required, autocomplete off)
    - `#hcaptcha-container` (hCaptcha 위젯 자리)
    - `button#btn_login` "로그인"
    - 하단 링크: "비밀번호 찾기"(`/member/find_password.html`) · "회원가입"(`/member/join_step1.html`)
  - "간편로그인": 네이버/카카오/페이코 버튼(이미지+라벨) + "휴대폰간편로그인"(로그인플러스 외부 광고, `safelogin.kr`, target=_blank)
  - 페이지 전용 `<style>`(login_form 폭 388/340, input 높이 49 등) + `main{min-height:450px}`
- 폼 검증 (클라이언트, legacy 그대로):
  - m_id 빈값 → `alert("아이디를 입력해주세요.")`
  - m_pwd 빈값 → `alert("비밀번호를 입력해주세요.")`
  - 통과 시 `runCaptcha()` → hCaptcha 성공 콜백 `onCaptchaSuccess(token)` → AJAX
- 제출 플로우:
  - `POST login_proc.php` (JSON): `{m_id, m_pwd, return_url, 'h-captcha-response': token}`
  - 응답 `{error_code, error_msg}`. `error_code=="0" || error_msg=="OK"` → `location.href = return_url || "/"`
  - 실패 → `alert(error_msg)` + `hcaptcha.reset()`
- SNS 플로우: 버튼 클릭 → `POST /api/{provider}/{provider}_login.php {mode}` → 응답 URL → `window.open(url, ...)` 팝업. 팝업 차단 시 alert. (팝업 내부 OAuth 콜백→`join_naver/kakao/payco()`→`join_step2.html`는 **후속 단위**)
- 세션/권한: 비로그인 진입. 성공 시 백엔드가 세션 쿠키 set.

## SSR·SEO (legacy)
- `<title>로그인</title>`, viewport `width=device-width, initial-scale=1.0`, description·author 빈값
- **canonical `https://directg.net/member/login.html`** (login.html은 canonical 있음)
- OG/구조화 데이터 없음
- 자산: `header_common.html` + hCaptcha 스크립트(`hcaptcha_common.js`, `js.hcaptcha.com/1/api.js`) — 실제 키 연동 시 도입. 페이지 전용 `<style>`
- 렌더: 폼/인터랙션 있어 `'use client'` 필요(jQuery submit·AJAX·팝업의 React 재현)

## 데이터 (legacy `login_proc.php`)
- `Member::memberLogin(m_id, m_pwd, ip)` → status/회원행. status `5`=미승인, `1`=탈퇴
- geoIP(`geoip2`) 국가 차단: RU,RO,BR,FR,VN,DE,PH,AT,NZ,NL,PL,GB,AE,IT,MO,IN,EC,CO,DK,CH,TH,CN,TW,HK,EG,AU,BG,HU → "해외에서는 해당서비스를 이용할수 없습니다."
- `Member::setMemberLogin(m_id, ip, country)` (로그인 기록)
- 세션 필드: `$_SESSION['member']` = {m_no, m_id, name, hp, nickname, mem_level, visitorId, mem_type}

## API 계약 (백엔드 전달)

### `POST /api/member/login`
- 요청: `{ m_id: string, m_pwd: string, return_url?: string, hCaptchaToken: string }`
  - (legacy 필드명 `h-captcha-response` → 계약은 `hCaptchaToken`으로 정규화)
- 응답: `{ error_code: "0"|"1", error_msg: string }` (legacy 형식 유지)
- 성공: `error_code="0", error_msg="OK"` + **`Set-Cookie: <session>; HttpOnly; Secure; SameSite=Lax`** (세션 필드 서버 보관)
- 실패 에러 문자열(원문 유지):
  - 캡차 없음/실패 → "캡챠 인증이 필요합니다." / "캡챠 인증에 실패했습니다. 다시 시도해주세요."
  - status 5 → "회원가입 승인 인증되지 않는 회원입니다."
  - status 1 → "이미 탈퇴한 회원입니다."
  - geoIP 차단 → "해외에서는 해당서비스를 이용할수 없습니다."
  - 자격 오류 → "아이디 또는 비밀번호 오류입니다."
- **백엔드 책임**: hCaptcha secret 검증(`hcaptcha.com/siteverify`), geoIP 국가 판정·차단, 비밀번호 검증, 세션 발급·쿠키 set, 로그인 기록(`setMemberLogin`)

### `GET /api/member/session` (후속 — SSR 헤더 로그인 상태)
- 쿠키 기반 현재 회원 반환 또는 null. (이 단위 미구현 — 헤더 인증 상태 단위에서)

### `POST /api/member/logout` (후속)
- 세션 파기 + 쿠키 삭제. legacy `logout.php`(`session_destroy`→`/index.php`)

### `POST /api/member/sns/{provider}/login-url` (provider: naver|kakao|payco)
- legacy `/api/{provider}/{provider}_login.php {mode}` 대응. 응답: `{ url: string }` (OAuth 인가 URL)
- **백엔드 책임**: OAuth state/redirect_uri 구성. 팝업 콜백→계정연결/가입은 후속 단위

> 쿠키 교차 출처: 백엔드가 프론트와 다른 origin이면 `apiClient`에 `credentials: 'include'` 필요(현재 미설정). 동일 출처/MSW는 기본 동작.

## 타겟 매핑
- 라우트: `app/member/login.html/page.tsx` → `/member/login.html` (canonical 포함 metadata)
- screen: `screens/member-login` (`'use client'`)
- entities: `entities/member-auth` (types + `postMemberLogin` + `postSnsLoginUrl`)
- mock: `POST /api/member/login`(stub captcha, 성공/실패 분기), `POST /api/member/sns/:provider/login-url`
- 보일러플레이트 제거: `app/login`, `screens/login` (login skeleton)
- 후속: SSR 헤더 로그인 상태(session/logout), SNS OAuth 콜백·계정연결, 회원가입(join_step1~5), 비밀번호 찾기, 본인인증(kcpcert)

## Parity 체크리스트
- [ ] 폼 필드/placeholder/필수/타입 일치
- [ ] 클라 검증 alert 문구·순서 일치
- [ ] 성공 시 return_url||"/" 이동, 실패 alert 일치
- [ ] SNS 버튼 UI + 팝업 open(치수·차단 alert) 일치
- [ ] 하단 링크·간편로그인 광고 배너 일치
- [ ] 페이지 전용 style·레이아웃 일치
- [ ] SEO: title/canonical/viewport 일치
