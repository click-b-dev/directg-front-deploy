# 회원가입 Step 2 — 약관동의

> 회원가입 sub-unit 2/5. `widgets/join-step-nav`(current=2) 재사용. 정적 동의 폼(KCP 게이트 없음).

## 원본
- 파일: `pc/member/join_step2.html` (라이브)
- 약관 텍스트: `pc/service/agreement.txt` (37K, HTML 포함) — `<pre>`에 PHP include로 inline
- 선행 단위: `member/join-step1.md`

## 화면·플로우
- 진입 URL: `/member/join_step2.html` (step1 "이메일 주소로 회원가입" 또는 SNS 콜백에서 진입)
- 화면 요소(`<div class="container my-3 pb-5"><main>` 내부):
  - 5단계 nav (step2 active, 링크 전부 `#` → `JoinStepNav current={2}`)
  - `form method="post" action="/member/join_step3.html"`:
    - hidden `sns_id`·`sns_email`·`name`·`access_token`·`sns_type` (전부 `value=""` — **legacy도 빈값**. PHP가 POST를 읽지만 hidden엔 안 넣음)
    - **카드1 [필수] 개인정보 수집 및 이용**: 안내 p + table(수집목적/항목/보유기간/근거, 3행) + checkbox `is_private`(required, value=Y)
    - **카드2 [필수] 이용약관**: `<pre>`(height 300 scroll, `agreement.txt` 렌더) + checkbox `is_agreement`(required, value=Y)
    - **카드3 [선택] 홍보 및 마케팅**: table(뉴스레터 1행) + checkbox `is_mailling`(value=Y). SMS/이벤트 행은 legacy에서 주석처리
    - submit "다음단계로"
- 검증: `is_private`·`is_agreement` HTML5 `required`(미체크 시 네이티브 차단). 통과 시 step3로 이동
- 세션/권한: 비로그인 진입

## SSR·SEO (legacy)
- `<title>약관동의</title>`, viewport `width=device-width, initial-scale=1.0`, description 빈값, author `H2interactive`, canonical/OG 없음
- 자산: `header_common.html`. 약관은 `agreement.txt` SSR inline
- 렌더: 폼 submit·required 검증 → `'use client'`. 약관 텍스트는 서버 page가 파일 읽어 prop 전달(SSR inline 유지)

## 데이터 (legacy)
- DB/AJAX 없음. `agreement.txt` 정적 include. is_mailling/is_event/sns_*는 step3로 POST 전달(step3가 재렌더)

## API 계약 (백엔드 전달)
- 없음(정적). 실제 가입 처리는 Step3 `join_proc.php` 계약에서.

## 멀티스텝 상태 (잠정)
- legacy는 step2 폼을 POST로 step3에 전달(is_mailling 등). Next는 페이지 라우트가 GET이라 **step2 제출 시 client 네비게이션**으로 `/member/join_step3.html`로 이동, `is_mailling`을 쿼리로 전달(잠정). **최종 멀티스텝 상태 전달 방식(POST/쿼리/sessionStorage)은 Step3 착수 시 확정** — step3가 소비자.
- sns_*는 legacy에서도 빈값이라 전달 대상 아님.

## 타겟 매핑
- 라우트: `app/member/join_step2.html/page.tsx`(서버 — agreement.txt fs 読) → `/member/join_step2.html`
- screen: `screens/member-join-step2` (`'use client'`, prop `agreementHtml`)
- widget: `widgets/join-step-nav`(current=2)
- 자산: `public/service/agreement.txt`(복사, legacy URL과 동일)

## Parity 체크리스트
- [ ] container 래퍼 + 5단계 nav(step2 active)
- [ ] 카드3종 구조·표·체크박스(required 2, 선택 1)
- [ ] 약관 pre 내용(agreement.txt)·스크롤 스타일
- [ ] hidden sns_* 빈값
- [ ] 다음단계로 → step3 이동, required 검증
- [ ] SEO(title/viewport/author) 일치
