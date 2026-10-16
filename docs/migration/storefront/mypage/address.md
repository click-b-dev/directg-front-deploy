# 배송지 (mypage/address)

## 원본
- 파일: `pc/mypage/mypage_address.html` (+ `address_proc.php` mode=setaddress)
- 도메인 클래스: `src/classes/Mypage.php::getMemberAddress` (+ address_proc upsert)
- 참조 문서: `docs/design-system/client.md`, `MEMBER-LIFECYCLE.md`, `ORDER-WORKFLOW-AUDIT.md`
- 선례: `entities/mypage-account`(세션 폼), `screens/member-login`(client 폼+fetch), `widgets/mypage-aside`
- vendor: **Daum Postcode**(`ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js`) — 개발자 게이트 결정(2026-09-03): 동일 스크립트 로드, `shared/lib/daum-postcode` 헬퍼로 추출(재사용)

## 화면·플로우
- 진입 URL: `/mypage/mypage_address.html`. **login_check(세션 필수)**.
- 레이아웃: `container my-3 pb-5` > `main.d-grid.gap-3`(240px auto) > aside_mypage + 폼(section 없이 main 직속 — 다른 mypage와 달리 `section#content` 래퍼 없음)
- 폼(`addressFrm`, POST, hidden `mode=setaddress`), `getMemberAddress`로 프리필:
  - 수령인 `name`
  - 주소: `zipcode`(readonly, maxlength5) + `우편번호 찾기` 버튼(#btn_zipcode) / `address`(readonly) / `address_detail`(상세주소)
  - 연락처 `phone` (입력 시 자동 하이픈 포맷: 02 지역번호/그 외/휴대폰 분기)
  - 배송메세지 `message`
  - 버튼: 돌아가기(#btn_cancel, **핸들러 없음 = 무동작**) / 정보 수정(submit)
- 인터랙션(legacy jQuery):
  - `우편번호 찾기` → `daum.Postcode`(도로명/지번 + bname + buildingName 조합) → zipcode/address 채우고 address_detail 포커스
  - submit preventDefault → zipcode/address 빈값 검증(alert) → serializeArray → `$.LoadingOverlay("show")` → AJAX POST address_proc.php → `alert(error_msg)` + LoadingOverlay hide (**location.reload 주석 = 새로고침 안 함**)
  - phone input 자동 포맷
- 세션/권한: **로그인 필수**

## SSR·SEO (legacy) — 템플릿 잔재 quirk
- **title `계정 설정`**(배송지 아님 — 복붙 잔재), aside `profile` active(배송지 전용 항목 없음)
- viewport **`width=device-width, initial-scale=1, shrink-to-fit=no`**(다른 페이지와 다름)
- description **"Bootstrap e-commerce html template similar to Alibaba"**, keywords **"Online template, shop, theme, template, html, css, bootstrap 4"**(템플릿 잔재)
- `http-equiv pragma no-cache`, `cache-control max-age=604800`
- author 메타 **없음**(이 페이지는 author meta 자체가 없음)
- canonical/OG 없음. `kcpcert/cert_conf.php` include하나 화면 미사용.

## 데이터 (legacy)
- `getMemberAddress($m_no)`: `SELECT idx,name,zipcode,address,address_detail,phone,message,reg_date,m_no,m_id FROM tbl_member_address WHERE m_no=:m_no` (단일 행, 없으면 빈 폼)
- `address_proc` setaddress: 세션(m_no) 확인 → `INSERT ... ON DUPLICATE KEY UPDATE tbl_member_address(name,zipcode,address,address_detail,phone,message,m_no,m_id,reg_date=NOW())` → `{error_code:OK, error_msg:"주소를 수정했습니다."}`; 세션 없으면 `{NG, "세션이 만료되었습니다."}`

## API 계약 (백엔드 전달)
- `GET /api/mypage/address` (세션 쿠키) → `MemberAddress { name, zipcode, address, address_detail, phone, message }` (없으면 빈 문자열들)
- `POST /api/mypage/address` (세션) body `{ name, zipcode, address, address_detail, phone, message }` → `{ error_code:"OK"|"NG", error_msg }` (upsert; 세션 만료 시 NG)
- 응답 타입: `entities/mypage-address/model/types.ts`

## 타겟 매핑
- 라우트: `app/mypage/mypage_address.html/page.tsx` → `/mypage/mypage_address.html` (`requireMemberSession()`, getMemberAddress deep import)
- screen: `screens/mypage-address` (server) — aside + `<AddressForm data>`(client)
- 컴포넌트: `screens/mypage-address/ui/address-form.tsx` (`'use client'`) — 프리필 폼 + Daum Postcode + 전화포맷 + 저장 fetch
- shared: `shared/lib/daum-postcode.ts` (신규, 재사용) — postcode.v2.js 로드 + `openDaumPostcode()` Promise(zonecode/address 조합)
- entities: `entities/mypage-address` (`getMemberAddress` server, `postMemberAddress` client)
- widget: `widgets/mypage-aside`(기존) active=profile(legacy와 동일)
- mock: `shared/mocks/fixtures/mypage-address.ts` + handler `GET/POST */api/mypage/address`

## 단위 경계 결정 / quirk
1. Daum Postcode: 동일 스크립트 로드, `shared/lib/daum-postcode` 헬퍼(재사용). 주소 조합 로직(도로명/지번+bname+buildingName) 원문 재현.
   - **URL 결정**: legacy 배송지의 구 엔드포인트 `ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js`는 현재 로드 실패(deprecated). legacy 사은품(gift)이 쓰는 현행 `t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js`로 로드 — **동일 Daum Postcode 위젯**이라 동작 동일, 런타임 로드 실패 해소.
2. title "계정 설정"·aside profile active·템플릿 잔재 meta·viewport shrink-to-fit·author 없음 모두 원문 유지.
3. 돌아가기 무동작(dead), 저장 성공 시 새로고침 안 함(reload 주석) 재현.
4. 전화 자동 하이픈 포맷 로직 원문 재현.
5. LoadingOverlay → 제출 중 버튼 disabled 대체(문의하기와 동일).
6. main 직속 폼(section#content 래퍼 없음) 구조 유지.

## Parity 체크리스트
- [ ] aside_mypage(계정 설정 active) + 폼(수령인/주소/우편번호찾기/상세/연락처/배송메세지)
- [ ] 프리필(getMemberAddress) 값 표시
- [ ] 우편번호 찾기 → Daum 팝업 → zipcode/address 채움
- [ ] zipcode/address 빈값 시 검증 alert
- [ ] 저장 → alert("주소를 수정했습니다.") (새로고침 없음)
- [ ] 전화 자동 하이픈 / 돌아가기 무동작
- [ ] SEO 잔재(title 계정 설정/viewport shrink-to-fit/description·keywords 템플릿/author 없음)
