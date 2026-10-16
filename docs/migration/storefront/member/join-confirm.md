# 이메일 인증 랜딩 (join_confirm)

> 회원가입 이메일의 [인증완료] 링크 도착지. 검증·승인은 100% 백엔드 → 프론트는 얇은 서버 라우트.

## 원본
- 파일: `pc/member/join_confirm.php` (HTML/헤더/푸터 include 없음 — bare text + redirect)
- 이메일 링크(legacy join_proc): `https://directg.net/member/join_confirm.php?m_no=&auth_key=&m_id=` (auth_key=`md5(m_id+m_no)`)
- 선행: `member/join-step3.md`(가입 성공 시 인증메일 발송)

## 화면·플로우
- 진입 URL: `/member/join_confirm.html?m_no=&auth_key=&m_id=` (GET, 이메일 링크)
- legacy 로직:
  - `chkMemberAuth(auth_key)` 조회 → 없으면 "잘못된 페이지 접근입니다." (bare text, exit)
  - `md5(trim(m_id)+m_no) == auth_key` 검증 → 성공: `approvalMember(m_no)` + `header("Location:/member/login.html")` (echo "가입승인이 완료되었습니다."도 있으나 output buffering에 따라 redirect가 우선 — **intent는 로그인 이동**) / 실패: "잘못된 페이지 접근입니다."
- 폼/인터랙션 없음. 세션 무관

## SSR·SEO (legacy)
- HTML 문서 아님(bare echo). title/meta 없음. → 프론트 라우트는 metadata 최소(가시 UI 없음, 성공은 즉시 redirect)
- 렌더: 서버 컴포넌트(SSR). searchParams 읽어 백엔드 검증 → redirect/error 텍스트. `'use client'` 불필요

## 데이터 (legacy)
- `Member::chkMemberAuth(auth_key)`, `md5` 검증, `Member::approvalMember(m_no)` — **전부 백엔드**

## API 계약 (백엔드 전달)
### `POST /api/member/join-confirm`
- 요청 `{ m_no, auth_key, m_id }`
- 응답 `{ error_code: "0"|"1", msg }`
- 백엔드 책임: `chkMemberAuth(auth_key)` 조회 + `md5(trim(m_id)+m_no)==auth_key` 검증 + 일치 시 `approvalMember(m_no)`. 실패 문구 "잘못된 페이지 접근입니다." 원문 유지
- 성공(`error_code=0`) → 프론트가 `/member/login.html`로 redirect

## 타겟 매핑
- 라우트: `app/member/join_confirm.html/page.tsx` (서버 — searchParams → API → redirect/error)
- screen: 없음(얇은 라우트, 가시 UI는 실패 텍스트뿐)
- entities: `entities/member-auth` `postMemberJoinConfirm`(신규)
- mock: `POST /api/member/join-confirm` (파라미터 존재 시 성공, 아니면 실패 — 실제 검증은 백엔드)

## 유의(경미)
- legacy 실패 텍스트는 bare(헤더/푸터 없음). 구현은 RootLayout 래핑됨(step3 가드·`.wrapper` 미도입과 동류). 성공은 redirect라 무관
- 성공 시 echo+header 동시(output buffering 의존) → intent(로그인 이동)로 redirect 채택

## Parity 체크리스트
- [ ] 성공(유효 파라미터) → `/member/login.html` redirect
- [ ] 실패(파라미터 누락/무효) → "잘못된 페이지 접근입니다."
- [ ] 검증 로직 백엔드 계약화(md5·approvalMember)
