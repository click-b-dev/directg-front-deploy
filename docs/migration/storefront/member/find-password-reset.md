# 비밀번호 찾기 — 재설정

## 원본
- 파일: `pc/member/find_password_reset.html` (라이브 — PHP 렌더 페이지, `.html` 확장자지만 PHP)
- 처리: `pc/member/join_proc.php` `mode=resetpassword`
- 선행 POST 출발지: `pc/member/user_certification.html`(인증번호 입력, `passwordResetFrm` hidden form이 `m_id`/`token`/`auth_code`를 POST)
- 데이터: `src/classes/Mypage.php` `getOtp`(L1118)·`updateNewPassword`(L609), `src/classes/Otp.php`
- 참조: `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우
- 진입: `POST /member/find_password_reset.html` — body `m_id`, `token`, `auth_code` (user_certification의 `passwordResetFrm` submit)
- `<title>`: `비밀번호 재설정` (find_password.html과 동일 head: description="", author="H2interactive", viewport `width=device-width, initial-scale=1.0`)
- **서버 가드** (DOCTYPE 이전, plain text echo + exit — HTML 미출력):
  - `$data = $mypage->getOtp($m_id)` → `$data['auth']=='0'` 이면 `echo "비정상적인 접근"; exit;`
  - `!$token` (POST 토큰 빈값) 이면 `echo "잘못된 접근입니다."; exit;`
  - ※ 가드는 (1) DB otp.auth != '0' (user_certification authConfirm이 auth='1'로 갱신), (2) POST token 비어있지 않음 — **DB token과 POST token을 비교하지는 않음**(legacy 그대로)
- 본문 (가드 통과 시):
  - 카드 제목 `비밀번호 찾기 - 재설정`
  - 안내문 `사용하실 비밀번호를 입력해 주세요` (text-start)
  - `form#memberFrm` POST action `/member/join_proc.php` (JS가 가로채 AJAX)
    - hidden `mode=resetpassword`
    - hidden `m_id=<POST m_id>`
    - `input#m_pwd[name=m_pwd]` type=password, required, placeholder `비밀번호를 입력해 주세요.`, label `비밀번호`
    - `input#m_pwd_re[name=m_pwd_re]` type=password, required, placeholder `비밀번호확인을 입력해 주세요.`, label `비밀번호 확인`
    - helper `#passwordHelpInline`: `영문소문자, 숫자, 특수문자를 포함하여 8자이상 16이하로 사용이 가능합니다. (@는 포함하실수 없습니다.)`
    - submit 버튼 `확인`
  - 레이아웃: `col-6` (find_password/user_certification은 col-12/col-6 상이) — reset은 `col-6`
  - page `<style>`: `main{min-height:450px}`

## 폼 필드/검증 (클라이언트, 제출 시 순서대로)
1. `pwd.length < 8 || > 16` → alert `비밀번호는 영문소문자, 숫자, 특수문자를 포함 8자리 이상 ~ 16이하로 입력해주세요.` return
2. 숫자·영문·특수문자 미포함 (`num<0 || eng<0 || spe<0`) → 동일 alert return
   - num = `/[0-9]/g`, eng = `/[a-z]/ig`(대소문자), spe = `/[`~!#$%^&*()|\\'_";:\/?]/gi`
3. 공백 포함 (`/\s/`) → alert `비밀번호는 공백없이 입력해주세요.` return
4. 허용 외 문자 (`spe2 = /[^0-9a-z`~!#$%^&*()|\\'_";:\/?]/gi`, i플래그로 A-Z 허용) → alert `비밀번호에 사용할 수 없는 문자가 포함되어 있습니다.` return
5. `m_pwd != m_pwd_re` → alert `비밀번호와 비밀번호 확인이 일치하지 않습니다.` return
- 통과 시 AJAX `POST /member/join_proc.php` — `#memberFrm` serialize = `{mode:resetpassword, m_id, m_pwd, m_pwd_re}` (token/auth_code 미포함)
- 성공(`error_code=="0"`) → `alert(data.msg)` → `window.location='/member/login.html'`
- `error_code!="0"` → **분기 없음**(alert도 이동도 없음, legacy 그대로)
- AJAX error → `alert('비밀번호찾기 중 오류가 발생했습니다. ' + error)`

## 분기/리다이렉트
- 서버 가드 실패 2종(비정상적인 접근 / 잘못된 접근입니다.) → plain text 후 종료
- 재설정 성공 → `/member/login.html`

## 세션/권한 의존
- 세션 로그인 불필요 (비로그인 흐름). OTP 상태(`tbl_otp`)로만 게이트.
- `m_id`/`token`/`auth_code`는 선행 화면(user_certification)에서 POST로 전달.

## SSR·SEO (legacy)
- title `비밀번호 재설정`, description 빈값, author H2interactive. canonical/OG/구조화데이터 없음.
- 페이지 CSS: head `<style>main{min-height:450px}`. 별도 page/*.css 없음.
- 렌더: PHP 서버 렌더(가드 → HTML). 폼 인터랙션은 jQuery.

## 데이터 (legacy)
- `Mypage::getOtp($m_id)` — `SELECT * FROM tbl_otp WHERE m_id=:m_id` → row `{m_id, token, otp, auth, expire}` (가드용)
- `Mypage::updateNewPassword($m_id,$m_pwd)` — `UPDATE tbl_member SET m_pwd=PASSWORD(:m_pwd) WHERE m_id=:m_id`
  - ⚠️ MySQL `PASSWORD()` 해시(레거시 방식) — 백엔드 책임. **OTP 인증 여부를 재검증하지 않음**(가드 부재, legacy 그대로).
- `join_proc.php mode=resetpassword`:
  - `m_pwd != m_pwd_re` → `{error_code:'1', msg:'새 비밀번호와 새 비밀번호 확인이 다릅니다.'}`
  - else → `updateNewPassword` → `{error_code:'0', msg:'비밀번호 변경이 완료되었습니다.'}`

## API 계약 (백엔드 전달)

### `GET /api/member/otp-status?m_id=<email>` (가드용 — getOtp 축소)
- 목적: 재설정 페이지 진입 가드. legacy `getOtp` 결과 중 가드에 필요한 필드만.
- 응답:
  - `auth: string` — '0'(미인증) / '1'(인증완료)
  - `exists: boolean` — otp row 존재 여부 (row 없으면 legacy `$data['auth']` undefined → `=='0'` 비교는 false지만, 안전하게 미존재도 비정상 접근 취급)
- 백엔드 책임: `tbl_otp` 조회, 인증 상태 반환. otp/token 원문은 노출하지 않는다(가드는 auth만 필요).

### `POST /api/member/reset-password`
- 요청: `{ m_id: string, m_pwd: string, m_pwd_re: string }`
- 응답(legacy JSON 형식 유지):
  - `error_code: string` — '0'=성공 / '1'=실패
  - `msg: string`
- 성공: `{ error_code:'0', msg:'비밀번호 변경이 완료되었습니다.' }`
- 불일치: `{ error_code:'1', msg:'새 비밀번호와 새 비밀번호 확인이 다릅니다.' }`
- 백엔드 책임: `tbl_member.m_pwd` 갱신(legacy는 `PASSWORD()`, 실제 백엔드는 안전 해시로 대체 가능 — 저장 결과 동일성만 유지). legacy는 OTP 인증 재검증 없음(가드 부재) 그대로.

## 타겟 매핑
- 라우트: `app/(pc)/member/find_password_reset.html/page.tsx`
- screen: `screens/member-find-password-reset`
- entity: `entities/member-auth` `getMemberOtpStatus`, `postMemberResetPassword` (+ 타입 2종)
- mock: `GET /api/member/otp-status`, `POST /api/member/reset-password`

## 진입(POST body) 처리 — 개발자 결정 완료: client state
legacy는 user_certification → reset로 **POST body**(m_id/token/auth_code) 전달 + 서버 가드. Next.js App Router 서버 컴포넌트는 POST body를 읽지 못한다. **개발자 승인(2026-09-14): client state 방식**.
- 재설정 screen은 `'use client'`. 진입 파라미터는 sessionStorage 키 `dg_password_reset`(`{ m_id, token, auth_code }` JSON)에서 읽는다.
- 선행 화면 `user_certification.html`(후속 이관)이 client 네비게이션 시 이 키를 채우고 `/member/find_password_reset.html`로 이동한다(URL 쿼리 없음 → **legacy URL parity 유지**, OTP token URL 노출 없음).
- mount 시 `getMemberOtpStatus(m_id)`로 가드(auth=='0'), 이어 token 유무 가드.
- **한계**: 새로고침·직접 진입 시 state 없음 → token 빈값 → "잘못된 접근입니다."(legacy도 POST 없이 직접 진입 시 token 빈값 → 동일 메시지, 동작 일치).

## Parity 체크리스트 (개발자 승인 완료 2026-09-14 ✅)
- [x] title/viewport/author/description 일치
- [x] 서버 가드 2종(비정상적인 접근 / 잘못된 접근입니다.) plain text 재현
- [x] 카드 제목·안내문·필드·placeholder·helper·col-6 레이아웃 일치
- [x] 클라이언트 검증 5종(순서·alert 문구·정규식) 일치
- [x] 성공 alert 후 `/member/login.html` 이동, error_code!=0 무분기 일치
- [x] AJAX error alert 접두 문구 일치
- [x] `main{min-height:450px}` page style 유지
- 승인 시 확인된 이탈(개발자 수용): 가드 텍스트가 `(pc)` 레이아웃 chrome(header/footer) 내부에 렌더(legacy는 bare echo). 진입 배선은 user_certification 이관 단위에서 완성.
