# 마이페이지 — 간편로그인 연결 (sns_login_connect)

## 원본

- 파일: `pc/mypage/sns_login_connect.html`
- 가드: `lib/login_check.php`
- aside: `aside_mypage.html`, active key `sns_login`
- 데이터: `Member::getMemberSnsLogin($m_no)`
- 외부 처리:
  - 연결 URL: `/api/payco/payco_login.php`, `/api/kakao/kakao_login.php`, `/api/naver/naver_login.php`
  - 연결해제: `/api/payco/payco_disconnect.php`, `/api/kakao/kakao_disconnect.php`, `/api/naver/naver_disconnect.php`

## 화면·플로우

- URL: `/mypage/sns_login_connect.html`, 로그인 필요.
- GET/POST 파라미터 없음.
- `$_SESSION['member']['m_no']`로 연결정보를 조회한다.
- 고정 provider 순서: `PAYCO`, `KAKAO`, `NAVER`.
- 연결정보 기본값: `{ sns_type, is:false, sns_connect_date:"", email:"" }`.
- 조회 결과의 `sns_type`을 대문자로 변환해 해당 provider 행에 덮어쓴다.
- 테이블:
  - 헤더: 간편로그인 종류 / 연결된 이메일 / 연결상태 / 연결일자 / 비고
  - 종류: `{TYPE} 간편로그인`
  - 연결상태: 연결됨 / 연결안됨
  - 연결됨: `btn btn-sm btn-danger`, `X 연결해제`
  - 연결안됨: `btn btn-sm btn-info`, `+ 계정연결`

## 연결 팝업

- 공통 위치: `top=(screen.availHeight - 600)/2`, `left=(screen.availWidth - 455)/2`
- PAYCO: `POST /api/payco/payco_login.php {mode:"payco_connect"}` → URL 문자열 → `window.open(url, "connect_payco", "height=560, width=500, ...")`
- KAKAO: `POST /api/kakao/kakao_login.php {mode:"kakao_connect"}` → URL 문자열 → `window.open(url, "connect_kakao", "height=560, width=500, ...")`
- NAVER: `POST /api/naver/naver_login.php {mode:"naver_connect"}` → URL 문자열 → `window.open(url, "connect_kakao", "height=700, width=500, ...")`
- 팝업 차단 시 alert:
  - `팝업이 차단되어있습니다.\n로그인 하시려면 팝업 차단을 해제해주시기 바랍니다.`
- NAVER popup name이 `connect_kakao`인 legacy 버그를 유지한다.

## 연결해제

- PAYCO: `POST /api/payco/payco_disconnect.php {sns_type:"PAYCO"}`
  - legacy 응답 raw string.
  - `data=="0"`이면 alert 없이 reload.
  - 아니면 `alert(data)`.
- KAKAO: `POST /api/kakao/kakao_disconnect.php {sns_type:"KAKAO"}`, JSON `{code,msg}`
  - `code=="0"`이면 `alert(msg)` 후 reload.
  - 아니면 `alert(msg)`.
- NAVER: `POST /api/naver/naver_disconnect.php {sns_type:"NAVER"}`, JSON `{code,msg}`
  - `code=="0"`이면 `alert(msg)` 후 reload.
  - 아니면 `alert(msg)`.
- AJAX error는 legacy가 `alert(jqXHR)`로 처리하므로 `[object Object]` 계열 메시지다.

## 데이터/SQL

```sql
select sns_type,sns_connect_date,sns_id,sns_name,email from sns_info where m_no=:m_no
```

- `m_no`: 세션 회원 번호.
- 정렬 없음. 화면은 고정 provider 순서로만 렌더하므로 결과 순서는 영향 없음.
- 연결되지 않은 provider는 백엔드 응답에 없고 프론트가 빈 행으로 채운다.

## API 계약 (백엔드 전달)

### `GET /api/mypage/sns-login`

- 세션 쿠키 필요. 비로그인 시 401 또는 로그인 redirect 응답.
- 응답 200:

```json
{
  "list": [
    {
      "sns_type": "PAYCO",
      "sns_connect_date": "2026-08-20 10:12:33",
      "sns_id": "payco-id",
      "sns_name": "홍길동",
      "email": "user@example.com"
    }
  ]
}
```

### `POST /api/mypage/sns/{provider}/connect-url`

- provider: `payco | kakao | naver`
- 요청: `{ "mode": "payco_connect" | "kakao_connect" | "naver_connect" }`
- 응답 200: `{ "url": "https://..." }`
- 백엔드 책임: legacy OAuth login PHP가 하던 state/redirect 구성.

### `POST /api/mypage/sns/payco/disconnect`

- 요청: `{ "sns_type": "PAYCO" }`
- 응답 200: `{ "result": "0" }` 성공. legacy raw string `"0"`을 JSON으로 감싼다.

### `POST /api/mypage/sns/{provider}/disconnect`

- provider: `kakao | naver`
- 요청: `{ "sns_type": "KAKAO" | "NAVER" }`
- 응답 200: `{ "code": "0", "msg": "연결해제 되었습니다." }`

## 타겟 매핑

- route: `apps/directg-client/src/app/mypage/sns_login_connect.html/page.tsx`
- screen: `apps/directg-client/src/screens/mypage-sns-login-connect`
- entity: `apps/directg-client/src/entities/mypage-sns-login`
- mock: `apps/directg-client/src/shared/mocks/fixtures/mypage-sns-login.ts`, `handlers.ts`
- aside: `MypageAside active="sns_login"`

## SSR·SEO

- title: `간편로그인 연결`
- description/keywords 빈값.
- author/canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1, shrink-to-fit=no` (`shrink-to-fit`은 Next 미표현 no-op이라 생략)
- http-equiv pragma/cache meta는 기존 마이페이지 단위와 동일하게 미재현.

## Parity 체크리스트

- [ ] 비로그인 접근 시 `/member/login.html` 가드.
- [ ] PAYCO/KAKAO/NAVER 3행 고정 순서.
- [ ] 연결된 provider는 이메일/상태/일자 + `X 연결해제`, 미연결 provider는 빈 이메일/일자 + `+ 계정연결`.
- [ ] PAYCO disconnect 성공 시 alert 없이 reload.
- [ ] KAKAO/NAVER disconnect 성공 시 alert 후 reload.
- [ ] connect popup 크기/이름/차단 alert 일치(NAVER name `connect_kakao` quirk 포함).
