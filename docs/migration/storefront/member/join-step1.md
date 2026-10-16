# 회원가입 Step 1 — 가입방법 선택

> 회원가입은 5단계 플로우(join_step1~5) + `join_proc.php` + 본인인증(kcpcert). **sub-unit 분할** 진행.
> 공통 5단계 progress nav는 `widgets/join-step-nav`로 위젯화(모든 step 재사용).
>
> **sub-unit 계획**:
> 1. **Step 1 가입방법 선택** (이 문서) — 정적 + SNS 간편가입 팝업(로그인 재사용) + 이메일가입 링크
> 2. Step 2 약관동의 — 개인정보/이용약관(agreement.txt)/마케팅 동의 폼
> 3. Step 3 정보입력 — 이메일 중복확인·비번검증·**KCP 휴대폰 본인확인(외부연동 게이트)**·visitorId·hcaptcha → `join_proc.php`
> 4. Step 4·5 인증대기/가입완료 — 정적 결과 화면
> 5. 이메일 인증(join_confirm) — 백엔드 + 확인 랜딩
>
> **게이트 예정**: Step 3 KCP 휴대폰 본인확인(kcpcert) — 외부 인증사(KCP) 연동. 착수 시 재현 방식(실연동 vs mock) 사용자 확인.

## 원본
- 파일: `pc/member/join_step1.html` (라이브)
- 참조 문서: `../legacy-project/docs/MEMBER-LIFECYCLE.md`, `docs/design-system/client.md`
- 선행 단위: `member/login.md` (SNS 팝업 동일 패턴)

## 화면·플로우
- 진입 URL: `/member/join_step1.html` (GET)
- 화면 요소:
  - 5단계 progress nav(`nav nav-pills nav-fill`) — Step1 active(`border-primary`), 링크 전부 `href="#"`
  - 카드 "가입방법 선택":
    - `#btn_join_naver` "NAVER로 간편가입" (초록 배경, `icon_naver.png`)
    - `#btn_join_kakao` "KAKAO로 간편가입" (노랑 배경, `icon_kakao.png`)
    - `#btn_join_payco` "PAYCO로 간편가입" (빨강 배경, `icon_payco.png`)
    - `#btn_join_email` "이메일 주소로 회원가입" → `/member/join_step2.html` (링크)
  - 페이지 전용 `<style>`: 3개 SNS 버튼 배경/색상
- SNS 플로우: 클릭 → `POST /api/{provider}/{provider}_login.php {mode}` → URL → `window.open` 팝업 (로그인과 동일: 창 치수, 카카오 창이름 `login_naver` 버그). 팝업 콜백(`join_naver/kakao/payco` → POST join_step2)은 **후속 단위**(콜백 페이지 미이관)
- 폼 검증/데이터: 없음(선택 화면)
- 세션/권한: 비로그인 진입

## SSR·SEO (legacy)
- `<title>가입방법 선택</title>`, viewport `width=device-width, initial-scale=1.0`
- description 빈값, author `H2interactive`, canonical/OG 없음
- 자산: `header_common.html` + 페이지 전용 `<style>`. SNS 아이콘 `icon_{naver,kakao,payco}.png`
- 렌더: SNS 버튼 팝업 인터랙션 있어 `'use client'`

## 데이터 (legacy)
- 도메인/SQL/AJAX: 없음(SNS login-url은 로그인 계약 `POST /api/member/sns/{provider}/login-url` 재사용)

## API 계약 (백엔드 전달)
- 신규 없음. SNS: `POST /api/member/sns/{provider}/login-url` (member/login.md 계약 재사용)

## 타겟 매핑
- 라우트: `app/member/join_step1.html/page.tsx` → `/member/join_step1.html`
- screen: `screens/member-join-step1` (`'use client'`)
- widget: `widgets/join-step-nav`(신규, current=1) — 공통 5단계 nav
- entities: `entities/member-auth` `openSnsLoginPopup`(신규 공통 util — 로그인도 이걸로 정리)
- 자산: `public/assets/images/member/icon_{naver,kakao,payco}.png` 복사
- mock: 기존 SNS login-url handler 재사용

## Parity 체크리스트
- [ ] 5단계 nav(Step1 active) 일치
- [ ] SNS 버튼 3종 색상·아이콘·라벨 일치
- [ ] SNS 팝업 동작(치수·차단 alert) 일치
- [ ] 이메일가입 링크 → join_step2 일치
- [ ] 페이지 style·레이아웃 일치
- [ ] SEO(title/viewport/author) 일치, canonical/OG 없음
