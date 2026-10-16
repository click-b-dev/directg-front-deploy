# 마이페이지 — 계정 설정 (account_settings)

> mypage 3번째 단위. 대형 페이지: 읽기전용 프로필 + 4개 뮤테이션(메일수신/메일주소/비번/탈퇴) + **KCP 본인인증(live)**.
> 개발자 결정: KCP 본인인증 = 버튼+startCert 플로우 재현, `cert-reg`는 mock(call_url 팝업), 실제 KCP는 백엔드 계약.

## 원본
- 파일: `pc/mypage/account_settings.html` (라이브, 448줄), 처리 `account_proc.php`, KCP `mypage/KCP_VERIFICATION/cert_reg.php`
- 가드 `login_check.php`, aside `aside_mypage`(active=profile)
- 선행: `mypage/mypage-main.md`(세션/가드/aside/대시보드)

## 화면·플로우
- URL: `/mypage/account_settings.html` (GET, 로그인 필요). aside active=계정 설정
- 데이터: `getMemberInfo(m_no)` → {m_id, name, hp, birth_day, is_auth, mailling, email}. (`getMemberSnsInfo`도 조회하나 이 화면 마크업엔 미사용 → 생략)
- 섹션:
  1. **회원 계정 상세정보**(읽기전용 plaintext): 아이디(m_id)·이름·휴대폰번호·생년월일 + **본인인증**: `is_auth=="Y"` → "인증완료" / 아니면 **휴대폰본인인증 버튼**(`startCert()`)
  2. **메일수신** 스위치: `checked=mailling=="Y"`. change → AJAX(mode=mailling_change) → alert + reload
  3. **수신 메일주소**: 표시(email||m_id) + 메일주소수정 버튼 → editable + 확인/취소. 확인 submit → emailCheck(정규식) 통과 시 AJAX(mode=email_change) → alert+reload, 실패 시 "유효하지 않은 이메일 주소입니다."
  4. **비밀번호 설정**: new_password + new_password_re + 검증(trim, 8~16, 영소문자/숫자/특수, 공백/금지문자, 일치, re 빈값) → AJAX(mode=change_password) → alert+reload
  5. **회원 탈퇴**: 버튼 → `#leave-modal`(유의사항) → 네 → confirm("정말로 탈퇴하시겠습니까?") → AJAX(mode=leave) → `/index.php` 이동
- **KCP 본인인증**(startCert): AJAX `POST cert_reg.php` → res_cd=="0000" && call_url && reg_cert_key → openCertPopup(window.open + form_cert submit to call_url). 실패 시 alert
- 세션: 로그인 필요. 뮤테이션 성공 후 `location.reload()`

## SSR·SEO (legacy)
- `<title>계정 설정</title>`
- **description="Bootstrap e-commerce html template similar to Alibaba", keywords="Online template, shop, theme, template, html, css, bootstrap 4"** (템플릿 잔재지만 parity상 원문 유지)
- viewport `width=device-width, initial-scale=1, shrink-to-fit=no`(shrink-to-fit 생략), http-equiv pragma/cache meta는 미재현(경미)
- 렌더: 폼 인터랙션 많음 → `'use client'`(데이터는 서버 route가 prop 전달)

## 데이터/계약 (백엔드 전달) — legacy account_proc.php 모드 매핑
### `GET /api/mypage/account`
- 쿠키 세션 → m_no. 응답 `{ m_id, name, hp, birth_day, is_auth: "Y"|"N", mailling: "Y"|"", email }` (getMemberInfo)
### `POST /api/mypage/account/mailling` { mailling: "Y"|"" } → `{ error_msg }` (mode=mailling_change)
### `POST /api/mypage/account/email` { email } → `{ error_msg }` (mode=email_change)
### `POST /api/mypage/account/password` { new_password, new_password_re } → `{ error_msg }` (mode=change_password)
### `POST /api/mypage/account/leave` → `{ error_msg }` (mode=leave). 성공 후 프론트 `/`(index) 이동
### `POST /api/mypage/cert-reg` → `{ res_cd, res_msg, call_url, reg_cert_key }` (KCP 거래등록). 백엔드/외부 KCP 연동. res_cd "0000"=성공

## 타겟 매핑
- 라우트: `app/mypage/account_settings.html/page.tsx` (서버 — 가드 + getMemberAccount)
- screen: `screens/mypage-account-settings` (`'use client'`)
- entities: `entities/mypage-account` (`getMemberAccount` server + mutation fetchers + `postCertReg`)
- widget: `widgets/mypage-aside`(active=profile)
- mock: account(GET) + 4 뮤테이션 + cert-reg. account fixture는 **is_auth="N"**(본인인증 버튼 노출 확인용)

## 유의/보류
- **KCP 본인인증**: 버튼+startCert+팝업 재현, cert-reg는 mock(call_url mock). 실제 KCP 거래등록/인증은 백엔드+외부.
- **LoadingOverlay**(jQuery vendor): 미도입(로그인과 동일, vendor 게이트).
- description/keywords 템플릿 잔재는 원문 유지. http-equiv cache meta 미재현(경미).
- 탈퇴 성공 → `/`(legacy `/index.php`).

## Parity 체크리스트
- [ ] 가드 / 프로필 읽기전용 4필드 + 본인인증 분기
- [ ] 메일수신 토글·메일주소 수정(정규식)·비번 변경(검증)·탈퇴 모달+confirm
- [ ] KCP 버튼 → cert-reg → 팝업(mock)
- [ ] 각 뮤테이션 alert+reload, 탈퇴 후 홈 이동
- [ ] SEO title, description/keywords 원문
