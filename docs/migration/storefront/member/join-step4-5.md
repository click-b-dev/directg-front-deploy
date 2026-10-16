# 회원가입 Step 4·5 — 인증대기 / 가입완료

> 회원가입 sub-unit 4·5(마지막). 둘 다 정적 결과 화면 → 서버 컴포넌트. `widgets/join-step-nav` **linked variant** 첫 사용.

## 원본
- 파일: `pc/member/join_step4.html`(인증대기), `pc/member/join_step5.html`(가입완료)
- 선행: `member/join-step3.md` (step3 가입 성공 → step4 이동)

## 화면·플로우
- **Step 4** `/member/join_step4.html` (step3 join 성공 후 진입. legacy는 POST 수신하나 로깅만·정적 표시)
  - `container my-3 pb-5 > main` + 5단계 nav (**step4 active, linked**: step1=`#`, step2·3·5=라우트, step4=`#`)
  - `row justify-content-center > col-5 > card shadow-none rounded-0`:
    - card-header `py-3 font-16 bg-body-secondary` > h5 "승인대기"
    - h4 "가입된 아이디(이메일)로 인증메일이 발송되었습니다."
    - p "수신된 인증메일에서 [인증완료]를 눌러주세요."
    - `form action="index.html"` > a `/member/login.html` `btn btn-primary btn-lg shadow-none` `<i class="mdi mdi-login">` 로그인
- **Step 5** `/member/join_step5.html` (가입완료)
  - 동일 레이아웃 + 5단계 nav (**step5 active, linked**)
  - `row justify-content-center > col-5 > card shadow-none`(rounded-0 **없음**):
    - card-header(클래스 없음) > h5 "가입완료"
    - h4 "가입완료이 완료되었습니다." (**legacy 오타 그대로**)
    - p "로그인 후 서비스 이용이 가능합니다."
    - `form action="index.html"` > a `/member/login.html` `btn btn-primary shadow-none`(btn-lg **없음**) 로그인
- 데이터/폼 로직: 없음(정적). 세션: 비로그인

## SSR·SEO (legacy)
- **두 페이지 모두 `<title>가입완료</title>`** (step4도 "가입완료" — legacy 그대로)
- viewport `width=device-width, initial-scale=1.0`, description 빈값, author `H2interactive`, canonical/OG 없음
- 렌더: 정적 → `'use client'` 불필요(서버 컴포넌트)

## 데이터/계약
- 없음(정적). step3 join 성공 후 인증메일은 join_proc가 발송(Step3 계약). 인증 확인은 `join_confirm`(후속 단위)

## 타겟 매핑
- 라우트: `app/member/join_step{4,5}.html/page.tsx` (서버, metadata title="가입완료")
- screen: `screens/member-join-step4`·`screens/member-join-step5` (서버 컴포넌트)
- widget: `widgets/join-step-nav`(current=4/5, `linked`) — step1 항상 `#` 처리 보완
- entities/mock: 없음

## Parity 체크리스트
- [ ] container·5단계 nav(active·linked: step1 `#`, step2~5 라우트)
- [ ] Step4 카드(rounded-0·bg-body-secondary 헤더)·문구·btn-lg 로그인
- [ ] Step5 카드(rounded-0 없음·헤더 클래스 없음)·오타 "가입완료이"·btn(비 btn-lg) 로그인
- [ ] title="가입완료"(양쪽)·viewport·author 일치
