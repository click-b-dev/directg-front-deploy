# 모바일 마이페이지 - 계정 설정 (account_settings)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/account_settings.html` (login_check) + 처리 `account_proc.php` + KCP `mypage/KCP_VERIFICATION/cert_reg.php`
- PC 대응: `screens/mypage-account-settings`(`entities/mypage-account`). **entity/mock 재사용**(증분 없음)
- 데이터: `Mypage::getMemberInfo(m_no)` → {m_id(세션), name, hp, birth_day, is_auth, ...}. (getMemberSnsInfo 조회하나 모바일 마크업 미사용 → 생략)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/account_settings.html`(GET), title "계정 설정". **세션 필수**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("계정 설정")`
- 본문 `#appCapsuleSub` — **PC보다 단순**(메일수신 토글/수신 메일주소 수정 섹션 **없음**):
  1. **회원 계정 상세정보**(`section.full` + `section-title.font-16` + `wide-block` + `form-group.boxed`): 아이디(m_id, readonly)·이름·휴대폰번호·생년월일(readonly `bg-cdeepdark border-0`) + **본인인증**: `is_auth=="Y"` → "인증됨"(텍스트, **PC "인증완료"와 다름**) / else `input.btn.btn-primary` "휴대폰본인인증"(onclick startCert) + 숨김 `form_cert`
  2. **비밀번호 설정**: new_password + input-info 안내 + new_password_re + `button.btn-primary.btn-lg.btn-block` "비밀번호 저장" → 검증 5종 → AJAX account_proc mode=change_password → alert(error_msg) + `location.replace("")`(reload)
  3. **회원 탈퇴**: 유의사항 p3 + `input.btn-danger` "회원탈퇴 요청"(`data-bs-toggle=modal` `#dialog_leave`) → 모달 → `#btn_member_leave` → confirm("정말로 탈퇴하시겠습니까?") → AJAX mode=leave → `location.href="/index.php"`
- KCP 본인인증(startCert): AJAX `POST cert_reg.php` → res_cd=="0000" && call_url && reg_cert_key → openCertPopup(window.open + form_cert submit). 실패 alert
- 비번 검증(legacy JS 5종): trim, 8~16, (숫자·영소문자·특수 포함), 공백 불가, 금지문자, 확인 불일치, re 빈값

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "계정 설정", description/keywords 빈값
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시) + bootstrap.min.js(모달 data-API). screen 전체 client(폼 인터랙션)

## 데이터 / API 계약
- **재사용(증분 없음)**: `getMemberAccount`(server-only, `GET /api/mypage/account`) · `postPasswordChange`·`postMemberLeave`·`postCertReg`(`entities/mypage-account`) · `requireMemberSession`
- **미사용**(모바일 마크업 없음): postMaillingChange·postEmailChange
- mock 기존 재사용(account GET + password + leave + cert-reg)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/account_settings.html`
- 라우트: `app/m/mypage/account_settings.html/page.tsx`(server, requireMemberSession + getMemberAccount)
- screen: `screens/mobile-mypage-account-settings`(**client**) — MobileSubHeader + 3섹션 + 탈퇴 Bootstrap 모달 + startCert/openCertPopup
- 재사용: `entities/mypage-account`·`member-auth`·`widgets/mobile-sub-header`
- 데스크톱 폴백: `app/(pc)/mypage/account_settings.html`(PC ✅)

## 보존할 legacy quirk / 결정
- 본인인증 완료 텍스트 "인증됨"(PC "인증완료"와 다름)
- 비번변경 성공 후 `location.replace("")`(현재 URL reload) → 구현은 `window.location.reload()`(동일 관측 동작)
- 탈퇴 성공 후 `/index.php` 이동(PC는 "/")
- 메일수신/수신 메일주소 섹션 없음(PC 대비)
- **KCP 본인인증**: PC에서 개발자 승인된 패턴 그대로(버튼+startCert+cert-reg mock+팝업, 실제 KCP는 백엔드). 신규 게이트 결정 아님

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드·MobileSubHeader("계정 설정")
- [x] 프로필 readonly 4필드(m_id/name/hp/birth_day) + 본인인증 분기("인증됨"/버튼)
- [x] 비번변경 검증 5종 + AJAX + alert + reload
- [x] 회원탈퇴 모달 + confirm + AJAX + /index.php 이동
- [x] KCP 버튼 → cert-reg → 팝업(mock)
- [x] 하단 네비 표시·title/viewport/theme#000
- [x] middleware rewrite + 데스크톱 폴백(PC account_settings)
