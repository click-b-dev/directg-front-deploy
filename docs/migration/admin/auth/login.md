# 관리자 로그인 (M1-1)

## 원본

- 파일: `pc/_Admin_/index.html` (로그인 폼), `pc/_Admin_/login_ps.php` (POST 처리), `src/classes/AdminMember.php` (`adminLogin`, `adminUpdate`)
- 라이브 버전 판별: 변형 파일(`yjs_*`/`kdy_*`/날짜접미) 없음 — 단일 버전.
- 참조 문서: `docs/legacy-admin/00-overview.md` §3, `../legacy-project/docs/ADMIN-AUTHORIZATION.md`

## 화면·플로우

- 진입 URL: `https://directg.net/_Admin_/` (`index.html`). 세션 검사 없음 — 로그인 상태여도 접근 시 폼이 보인다.
- 화면 요소: 로고(`/assets/images/logo/H2_DG_BI_nm_194x45_v2.png`) → 로그인 카드 → footer `2024 © H2 Interactive`. 문서 title `다이렉트 게임즈 관리자시스템`.
- 폼 필드/검증:
  - `admin_id`: `type=email`, `required`, placeholder `Enter your email`, 라벨 `Email address`
  - `admin_pwd`: `type=password`, **required 없음**, placeholder `Enter your password`, 라벨 `Password`, 비밀번호 표시 토글(password-eye)
  - 제출 버튼: `로그인`
- 처리 플로우 (`login_ps.php`):
  1. `AdminMember($conn_dgkr)::adminLogin(admin_id, admin_pwd, ip)` 호출
  2. `error_code=="OK"` → `$_SESSION['admin'] = {admin_id, admin_name, admin_level}` 저장 후 분기:
     - `admin_level=="1"` → `Location: /_Admin_/goods/title_list.php` (상품 뷰어)
     - 그 외 → `Location: /_Admin_/main.php`
  3. 실패 → **빈 페이지에 `error_code` 문자열만 echo** 후 exit (예: `NO_AUTH_CONFIRM`)
  4. `PDOException` → `Error!: <메시지>` echo 후 die
- 세션/권한 의존: 없음(비로그인 화면). 성공 시 세션 생성이 본 단위의 산출.

> ⚠️ **의도적 divergence (사용자 승인)**: 실패 시 legacy는 `error_code` 원문을 그대로 출력하지만,
> 본 이관에서는 **error_code → 사용자 메시지 매핑**으로 표시한다(폼 인라인, `text-danger`).
> 매핑 문구는 legacy `AdminMember::adminLogin`의 `error_msg` 도메인 텍스트를 사용(선행 공백 정리):
> `NO_AUTH_CONFIRM` → "미승인된 회원입니다.", `NOT_FOUND` → "존재하지 않는 회원입니다."
> 매핑에 없는 코드는 응답 `error_msg` → 코드 원문 순으로 폴백. `PDOException` 분기(`Error!: ...`)는 legacy 그대로.

## 데이터 (legacy)

- 클래스·메서드: `AdminMember::adminLogin` — `select admin_id,admin_pwd,admin_name,admin_level,status,employeeFl from tbl_admin where admin_id=:admin_id and admin_pwd=password(:admin_pwd)` (**dgkr DB**, MySQL 레거시 `PASSWORD()` 해시)
- 분기 (원문 순서 그대로):
  1. `$data['status'] <> "y"` → `{error_code: "NO_AUTH_CONFIRM", error_msg: " 미승인된 회원입니다."}`
  2. `$data['admin_id'] == ""` → `{error_code: "NOT_FOUND", error_msg: "존재하지 않는 회원입니다."}`
  3. 그 외 → `{error_code: "OK", error_msg: "성공", data}` + `adminUpdate` (`update tbl_admin set ip=:ip, login_date=now()`)
- ⚠️ **legacy 특성(그대로 이관)**: 행이 없으면 `fetch()`가 `false`라 1번 분기가 먼저 걸린다. 따라서 **미존재 계정·비밀번호 오답 모두 `NO_AUTH_CONFIRM`**이 반환되고, `NOT_FOUND`는 사실상 도달 불가.

## API 계약 (백엔드 전달)

### `POST /admin/auth/login`

요청:

```json
{ "admin_id": "string(email)", "admin_pwd": "string" }
```

응답 200 (성공/실패 모두 200, legacy envelope 유지):

```json
{ "error_code": "OK", "error_msg": "성공",
  "data": { "admin_id": "...", "admin_name": "...", "admin_level": "99", "accessToken": "..." } }
```

```json
{ "error_code": "NO_AUTH_CONFIRM", "error_msg": " 미승인된 회원입니다." }
```

- `error_code`: `OK` | `NO_AUTH_CONFIRM` | `NOT_FOUND` (문자열 원문 유지. `NOT_FOUND`는 legacy상 도달 불가 — 동일 분기 순서를 유지할 것)
- `admin_level`: 문자열 (`"1"` 상품뷰어 / `"99"` 슈퍼 / 그 외 일반). 프론트 분기가 문자열 비교이므로 숫자로 바꾸지 말 것.
- **백엔드 책임**: ① `tbl_admin`(dgkr) 조회와 위 분기 순서 재현 ② 성공 시 `ip`, `login_date` 갱신(`adminUpdate` 상당) ③ MySQL `PASSWORD()` 해시 검증 대체(마이그레이션 전략은 백엔드 결정) ④ `accessToken` 발급(legacy PHP 세션의 대체 — 방식은 백엔드 결정, 프론트는 Bearer 전제)
- 서버측 권한 강제 없음이 legacy 현행(로그인 여부만 검사). RBAC 강화는 별도 결정 사항.

## 타겟 매핑

- 라우트: `/login` (스타트킷 가드의 공개 경로·리다이렉트 대상. legacy `/_Admin_/` 루트 = 로그인 폼 → SPA에서는 비인증 접근 시 `/login`으로 유도되는 형태로 대응)
- 성공 분기: `admin_level=="1"` → `/goods/title_list`, 그 외 → `/main` (두 라우트는 이관 대기 스텁으로 생성, MIGRATION-MAP 미집계)
- screen: `src/screens/login/ui/login-screen.tsx` / entities: `src/entities/admin-auth/` (types + fetcher)
- 세션 저장: 스타트킷 `AuthProvider.setSession` 재사용 — `user: {id: admin_id, name: admin_name, role: admin_level}`
- 레이아웃: legacy 로그인은 topbar/sidebar 없는 독립 `authentication-bg` 화면. 스타트킷 `LayoutShell`이 전 라우트에 사이드바+헤더 shell을 씌우던 것을 `isPublicPath`(공유 route-guard: `/login`,`/demo`) 기준으로 분기 — public 경로는 shell 없이 children만 렌더. 인증 후 화면의 실제 shell(Hyper topbar/sidebar/footer)은 M1 #3-6에서 재현.
- mock: `src/shared/mocks/handlers/admin-auth.ts` — 계정 fixture 3종(일반 99/뷰어 1/미승인) + legacy 분기 재현
- base URL 동작(정정): ky v2는 `prefixUrl`을 `prefix`로 개명했으므로 `createApiClient({ prefix })`는 **정상 적용**된다. 클라이언트는 `env.apiBaseUrl`(`/api`)을 input에 prepend → 실제 요청은 **`/api/admin/auth/login`**. 따라서 MSW handler도 동일 base를 붙여 등록해야 한다(`src/shared/mocks/handlers/admin-auth.ts`가 `env.apiBaseUrl`을 재사용). 계약 문서의 논리 경로 `POST /admin/auth/login`은 API base(`/api`) 하위로 서빙되는 것을 전제한다. (초기 주석의 "prefix 무시" 서술은 ky v1 기준 오해였음 — 404 원인.)

## Parity 체크리스트

- [ ] 화면 요소 일치 (로고/라벨/placeholder/버튼/footer/title)
- [ ] 필드/검증 일치 (`admin_id` email+required, `admin_pwd` required 없음, 비밀번호 표시 토글)
- [ ] 분기/플로우 일치 (level "1" → 상품 목록 / 그 외 → 대시보드)
- [ ] 실패 UI (divergence): error_code → 메시지 매핑 표시(`NO_AUTH_CONFIRM`→"미승인된 회원입니다." 등), 폴백 동작
- [ ] 엣지케이스 일치 (미존재 계정·오답 → `NO_AUTH_CONFIRM`, 미승인 → `NO_AUTH_CONFIRM`, 예외 → `Error!: ...`)
