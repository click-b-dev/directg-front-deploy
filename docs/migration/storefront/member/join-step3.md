# 회원가입 Step 3 — 정보입력

> 회원가입 sub-unit 3/5. **KCP 본인인증 게이트 해소**: 라이브 `join_step3.html`에서 이름/생년월일+휴대폰 본인확인 블록이
> **주석 처리(`<!-- -->`)** 되어 렌더 안 됨 → 본인인증은 범위 밖. join_proc도 `name=이메일 로컬파트`로 가입.
> 개발자 결정: 멀티스텝 상태=**URL 쿼리**, visitorId=**stub**(실제 fingerprint 후속), hCaptcha=**stub**(로그인과 동일).

## 원본
- 파일: `pc/member/join_step3.html` (라이브, 본인인증 주석), 처리 `pc/member/join_proc.php`
- 선행: `member/join-step2.md`. 참조: `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우
- 진입 URL: `/member/join_step3.html` (step2 제출에서 `?is_private=Y&is_agreement=Y[&is_mailling=Y]`)
- **직접접근 가드**(legacy): `is_private<>"Y" && is_agreement<>"Y"` → `echo "잘못된 접근입니다."; exit;` (bare text). 서버 page에서 재현
- 화면(`container my-3 pb-5 > main`):
  - 5단계 nav (step3 active) → `JoinStepNav current={3}`
  - `offset-1 col-10` 카드 "기본정보 입력", `form#form_auth`:
    - hidden `mode=join`·`is_mailling`·`is_event`·`id_chk`·`visitorId`
    - 아이디(이메일) `m_id`(email, required) + **아이디 중복확인** 버튼
    - 비밀번호 `m_pwd`(required) + 안내문(영소문자/숫자/특수문자 8~16, @ 불가)
    - 비밀번호확인 `m_pwd_re`(required) + 동일 안내문
    - 가입완료 submit + `#hcaptcha-container`
  - **주석 제외(미렌더)**: 이름/생년월일 + 휴대폰 본인확인 버튼(KCP). **죽은 KCP hidden 필드**(ordr_idxx, req_tx, cert_method, web_siteid, site_cd, Ret_URL, cert_otp_use, res_cd, veri_up_hash, auth_enc 등)는 본인확인 트리거 부재로 미사용 → **의도적 생략**(behavior-neutral, idiomatic). auth_data/auth_type_check JS도 미사용
- 검증(legacy JS 그대로):
  - 중복확인: 빈값 → `alert("아이디를 입력하세요.")`, 아니면 AJAX `idChk`. error_code=1 → alert(msg)+id/m_id 초기화, else id_chk=1 + `alert("등록이 가능한 아이디입니다.")`
  - 제출: id_chk 없음 → `alert("아이디 중복확인을 하세요.")`; 길이 8~16, `[0-9]`·`[a-z]/i`·특수문자 포함, 공백 불가, 금지문자 불가, m_pwd==m_pwd_re. 통과 → runCaptcha → onCaptchaSuccess(token) → join
  - join error_code=0 → `/member/join_step4.html` 이동, else alert(msg)
- 세션: 비로그인. visitorId=Fingerprint2 (stub)

## SSR·SEO (legacy)
- `<title>정보입력</title>`, viewport `width=device-width, initial-scale=1.0`, description 빈값, author `H2interactive`, canonical/OG 없음
- 자산: header_common + (실키 연동 시) hcaptcha·fingerprint2 스크립트. 렌더: 폼 인터랙션 `'use client'`

## API 계약 (백엔드 전달)

### `POST /api/member/check-id` (legacy join_proc `mode=idChk`)
- 요청 `{ m_id }`. 응답 `{ error_code: "0"|"1", msg }`
- `chkJoinDomain`(차단 도메인) false → `error_code=1, "가입이 불가능한 도메인입니다."`
- 기존 회원 존재 → `error_code=1, "이미 가입된 아이디입니다"`; 없음 → `error_code=0, "ok"`

### `POST /api/member/join` (legacy join_proc `mode=join`)
- 요청 `{ m_id, m_pwd, m_pwd_re, is_mailling, is_event, visitorId, hCaptchaToken }`
- 응답 `{ error_code, msg }`. 성공 `error_code=0, "회원가입 성공"`
- **백엔드 책임**(원문 유지): hCaptcha secret 검증("캡챠 인증이 필요합니다."/"캡챠 인증에 실패했습니다."), IP 리셀러 차단(`error_code=3, "더이상 회원가입을 하실수 없습니다."`), geoIP 국가 차단(`error_code=2, "해외에서는 회원가입을 하실 수 없습니다."`), 차단 도메인, 비번 일치(`"비밀번호 오류"`), 회원 생성(`setMemberAuth`, is_auth=N, name=이메일 로컬파트, mem_type R/P), 인증메일 발송 + authkey(`join_confirm.php`)
  - 성공 후 legacy는 인증메일 발송(`join_confirm.php?m_no&auth_key&m_id`) → Step4 인증대기

## 멀티스텝 상태 (확정: URL 쿼리)
- step2 제출 → `?is_private=Y&is_agreement=Y[&is_mailling=Y]`. step3 서버 page가 쿼리로 가드 + is_mailling/is_event를 hidden 세팅. is_event는 step2에 없어 빈값

## 타겟 매핑
- 라우트: `app/member/join_step3.html/page.tsx` (서버 — searchParams 가드) → `/member/join_step3.html`
- screen: `screens/member-join-step3` (`'use client'`, props is_mailling/is_event)
- entities: `entities/member-auth` `postMemberCheckId`·`postMemberJoin`(신규)
- mock: `POST /api/member/check-id`, `POST /api/member/join`(captcha stub)
- step2 수정: 제출 쿼리에 is_private/is_agreement 추가(DOM 불변)

## Parity 체크리스트
- [ ] container·5단계 nav(step3) / 직접접근 가드 "잘못된 접근입니다."
- [ ] 이메일+중복확인, 비번+확인+안내문
- [ ] 중복확인 AJAX 분기·alert 문구
- [ ] 비번 검증 규칙·alert 순서, 성공 시 step4 이동
- [ ] 본인인증(주석) 미렌더 / 죽은 KCP 필드 생략(behavior-neutral)
- [ ] SEO(title/viewport/author) 일치
