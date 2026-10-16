# 비밀번호 찾기 — 인증번호 입력

## 원본
- 파일: `pc/member/user_certification.html` (라이브 — PHP 렌더, `.html` 확장자지만 PHP)
- 처리: `pc/member/join_proc.php` `mode=authConfirm` (L294–315)
- 선행 POST 출발지: `pc/member/find_password.html`(가입여부확인 성공 → `m_id`/`token` POST)
- 후속 POST 목적지: `pc/member/find_password_reset.html`(`passwordResetFrm`이 `auth_code`/`token`/`m_id` POST)
- 데이터: `src/classes/Mypage.php` `getOtp`(L1118)·`updateOtp`(L1129)
- 참조: `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우
- 진입: `POST /member/user_certification.html` — body `m_id`, `token` (find_password의 hidden form submit)
  - ※ 서버는 `m_id`, `token`만 읽고 렌더 — **가드 없음**(reset 페이지와 달리 getOtp 체크 없음)
- `<title>`: `비밀번호 재설정` (find_password/reset와 동일 head: description="", author="H2interactive", viewport `width=device-width, initial-scale=1.0`)
- 본문:
  - 카드 제목 `비밀번호 찾기 - 인증번호 입력`
  - 안내문 `받으신 안내메일의 인증번호를 입력해 주세요.` (text-start)
  - `form#memberFrm` POST action `/member/join_proc.php` (JS가 가로채 AJAX)
    - hidden `mode=authConfirm`
    - hidden `email=<POST m_id>` (⚠️ POST로 받은 `m_id`가 `email` 필드에 실림 — authConfirm은 email 파라미터 사용)
    - hidden `token=<POST token>`
    - `input#auth_code[name=auth_code]` type=text, required, placeholder `메일로 전송받은 인증번호`, label `인증번호`
    - submit 버튼 `확인`
  - `form#passwordResetFrm` POST action `find_password_reset.html` (인증 성공 시 JS가 값 채워 submit)
    - hidden `auth_code`(빈값→JS 주입), hidden `token`(빈값→JS 주입), hidden `m_id=<POST m_id>`
  - 레이아웃: `col-12` (reset은 col-6, find_password는 col-12)
  - page `<style>`: `main{min-height:450px}`

## 폼 필드/검증
- `auth_code` required(HTML5) 외 별도 클라이언트 검증 없음
- 제출: AJAX `POST /member/join_proc.php` — `#memberFrm` serialize = `{mode:authConfirm, email:m_id, token, auth_code}`
  - 성공(`error_code=="0"`) → `alert(data.msg)` → `passwordResetFrm` 에 `auth_code=data.auth_code`·`token=data.token` 주입 → `passwordResetFrm.submit()` (find_password_reset.html로 POST)
  - 실패(`error_code!="0"`) → `alert(data.msg)` (이동 없음)
  - AJAX error → `alert('비밀번호찾기 중 오류가 발생했습니다. ' + error)`

## 분기/리다이렉트
- 인증 성공 → `find_password_reset.html` (m_id/token/auth_code 전달)
- 인증 실패 → alert만, 화면 유지

## 세션/권한 의존
- 세션 로그인 불필요. OTP 상태(`tbl_otp`)로만 검증.
- `m_id`/`token`은 선행 화면(find_password)에서 POST 전달.

## SSR·SEO (legacy)
- title `비밀번호 재설정`, description 빈값, author H2interactive. canonical/OG/구조화데이터 없음.
- 페이지 CSS: head `<style>main{min-height:450px}`.
- 렌더: PHP 서버 렌더(가드 없이 폼). 인터랙션은 jQuery.

## 데이터 (legacy) — `join_proc.php mode=authConfirm`
- `$data = $mypage->getOtp($email)` — `SELECT * FROM tbl_otp WHERE m_id=:m_id`
- `if($data['token']==$token && $data['otp']==$auth_code)`:
  - `$mypage->updateOtp($email,'1')` — `UPDATE tbl_otp SET auth='1' WHERE m_id=:m_id` (이후 reset 페이지 가드 통과)
  - `{error_code:"0", auth_code, token, msg:"인증에 성공하였습니다."}`
- else:
  - `{error_code:"1", msg:"인증정보가 일치하지 않습니다.".$token}` — ⚠️ **실패 msg 끝에 token 문자열 append**(legacy quirk, verbatim 이식)

## API 계약 (백엔드 전달)

### `POST /api/member/auth-confirm`
- 요청: `{ email: string, token: string, auth_code: string }` (legacy: email=선행 m_id)
- 응답(legacy JSON 형식 유지):
  - `error_code: string` — '0'=성공 / '1'=실패
  - `msg: string`
  - `auth_code?: string` — 성공 시 반환(reset로 전달)
  - `token?: string` — 성공 시 반환(reset로 전달)
- 성공: `{ error_code:'0', auth_code, token, msg:'인증에 성공하였습니다.' }`
- 실패: `{ error_code:'1', msg:'인증정보가 일치하지 않습니다.'+token }` (msg에 token 접미 — legacy 그대로)
- 백엔드 책임: `tbl_otp` 조회 후 token·otp 대조, 성공 시 `auth='1'` 갱신. 실패 msg의 token 접미 quirk 유지.

## 타겟 매핑
- 라우트: `app/(pc)/member/user_certification.html/page.tsx`
- screen: `screens/member-user-certification` (**client**)
- entity: `entities/member-auth` `postMemberAuthConfirm` (+ 타입 2종)
- mock: `POST /api/member/auth-confirm`

## 진입/후속 배선 — client state (이전 단위 승인 결정 계승)
회원 인증 체인은 client state(sessionStorage) + GET 이동으로 URL parity를 유지한다(2026-09-14 승인). Next 페이지 라우트는 POST body를 못 읽으므로 legacy hidden-form POST를 대체한다.
- **진입**: `find_password` 성공 시 `sessionStorage['dg_user_certification'] = { m_id, token }` 저장 후 `/member/user_certification.html`로 이동. user_certification screen이 mount 시 읽는다.
- **후속**: authConfirm 성공 시 `sessionStorage['dg_password_reset'] = { m_id, token:data.token, auth_code:data.auth_code }` 저장 후 `/member/find_password_reset.html`로 이동(이전 단위가 이 키를 소비).
- **find_password 화면 배선 변경 필요**: 현재 `/member/user_certification.html`로 hidden-form **POST** → Next 라우트에 POST 시 405. `sessionStorage['dg_user_certification']` 저장 + `window.location`(GET) 이동으로 교체. 동작(이동·전달 데이터) 동일, 메커니즘만 client state화.

## Parity 체크리스트 (개발자 승인 완료 2026-09-14 ✅)
- [x] title/viewport/author/description 일치
- [x] 카드 제목·안내문·col-12 레이아웃 일치
- [x] 필드/placeholder/label 일치, auth_code required
- [x] authConfirm serialize(email=m_id, token, auth_code) 일치
- [x] 성공 alert→auth_code/token 주입→find_password_reset 이동 일치
- [x] 실패 alert(msg+token quirk) 유지, 이동 없음
- [x] AJAX error alert 접두 문구 일치
- [x] `main{min-height:450px}` page style 유지
- [x] find_password → user_certification 배선(client state) 동작 일치
- 승인 시 확인된 변경(개발자 수용): 이미 ✅된 find_password 화면의 후속 이동을 hidden-form POST → client state + GET으로 전환(Next 라우트 POST 405 회피). 화면/필드/SEO 불변.
