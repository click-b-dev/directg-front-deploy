# 세션 가드 + 로그아웃 (M1-2)

## 원본

- 파일: `pc/_Admin_/lib/lib.php` (모든 관리자 페이지가 include 하는 세션 가드), `pc/_Admin_/logout.php` (로그아웃)
- 라이브 버전 판별: 변형 파일(`yjs_*`/`kdy_*`/날짜접미) 없음 — 단일 버전.
- 참조 문서: `docs/legacy-admin/00-overview.md` §3, `../legacy-project/docs/ADMIN-AUTHORIZATION.md`
- 선행 단위: [로그인(M1-1)](login.md) — 세션 생성 산출. 본 단위는 세션 검사·파기를 다룬다.

## 화면·플로우

### 세션 가드 (`lib/lib.php`)

- 모든 관리자 페이지 상단에서 include. `session_start()` 후 DB 커넥션·`$ip`·`$topmenu`(13종 상단 메뉴 배열)를 준비한다.
- 가드 분기 (원문 그대로):
  ```php
  if($_SESSION['admin']["admin_id"]==""){
      echo "잘못된 접근입니다.";
      header( 'Location: https://<host>/_Admin_/' );
      exit;
  }
  ```
  → 세션에 `admin.admin_id`가 없으면 **"잘못된 접근입니다." 출력 후 `/_Admin_/`(로그인 폼)으로 리다이렉트**하고 종료.
- 세션은 **서버측 PHP 세션**($_SESSION). 매 요청 서버가 검사한다. 클라이언트에 토큰 개념 없음.

### 로그아웃 (`logout.php`)

- `$_SESSION = array(); session_destroy();` 후 `Location: /_Admin_/`(로그인)로 리다이렉트.
- **DB 쓰기·API 호출 없음.** 순수 세션 파기.

## 데이터 (legacy)

- 도메인 클래스 없음 — PHP 세션 원시 조작만.
- `$_SESSION['admin']` 구조: `{admin_id, admin_name, admin_level}` (로그인 시 `login_ps.php`가 저장, [login.md](login.md) 참조).

## 타겟 매핑 (토큰 모델 등가)

legacy의 서버 PHP 세션 → SPA는 `AuthProvider` + Bearer accessToken(localStorage `click-b.auth`)으로 대체([login.md](login.md) 결정 계승).

| legacy 동작 | SPA 등가 | 구현 위치 |
|-------------|----------|-----------|
| `lib.php` 가드: 세션 없으면 로그인으로 리다이렉트 | `RouteGuard`(비-public 경로 + 미인증 → `/login?redirect=`) — **이미 존재**(스타트킷). front 동작 동일. | `features/route-guard`, `shared/lib/route-guard` |
| `logout.php`: `session_destroy` + 로그인 리다이렉트 | 로그아웃 fetcher 호출 → 로컬 세션 파기(`setSession(null)`) → `/login` 이동. **엔드포인트 실패해도 로컬 세션은 파기**(legacy 항상 파기). | `entities/admin-auth`(`adminLogout`) + 트리거(로그아웃 버튼은 topbar M1-3에 배치) |
| 서버가 매 요청 세션 검사 | 백엔드가 매 보호 엔드포인트에서 Bearer 토큰 검증 → 무효 시 `401` | 백엔드 책임(아래 계약) |

> ⚠️ legacy 가드/로그아웃은 순수 세션 조작이라 **자체 API 호출이 없다.** 본 단위가 새로 추가하는 mock 엔드포인트는 **로그아웃(토큰 무효화)** 하나뿐이다. 세션 가드의 front 동작은 이미 `RouteGuard`로 구현되어 있어 신규 API가 필요 없다.

## API 계약 (백엔드 전달)

### `POST /admin/auth/logout`

legacy `logout.php`의 `session_destroy()` 등가 — 토큰 모델이므로 서버측 토큰 무효화가 필요하다(PHP 세션과 달리 토큰은 서버 상태를 가질 수 있음).

요청: 본문 없음. `Authorization: Bearer <accessToken>` 전제.

응답 200 (성공/실패 모두 200, [login.md](login.md) envelope 유지):

```json
{ "error_code": "OK", "error_msg": "성공" }
```

- `error_code`: `OK` (문자열 원문 유지). legacy 로그아웃은 항상 성공(세션 파기).
- **백엔드 책임**: ① 전달된 Bearer 토큰(및 연관 refresh 토큰) 무효화 ② 무효 토큰이어도 `OK` 반환(멱등) — 프론트는 응답과 무관하게 로컬 세션을 파기한다.

### 세션 가드 — 백엔드 요구사항 (신규 엔드포인트 아님)

- 모든 **보호 엔드포인트**는 `Authorization: Bearer` 토큰을 검증한다. 무효/누락 시 `401`을 반환한다(legacy 서버 세션 검사 등가).
- 프론트는 `401` 수신 시 로컬 세션을 파기하고 `/login`으로 유도한다(legacy "잘못된 접근입니다." → `/_Admin_/` 리다이렉트 등가). 이 401 처리 배선은 후속 단위(보호 API 최초 호출 단위)에서 `api-client` 인터셉터로 다룬다 — 본 단위 범위 밖(가드의 클라이언트 라우팅 동작만 대상).

## Parity 체크리스트

- [ ] 세션 가드: 미인증 상태로 보호 라우트 접근 → 로그인으로 리다이렉트 (RouteGuard 기존 동작)
- [ ] 로그아웃: 세션 파기 후 `/login` 이동, 재접근 시 로그인 요구
- [ ] 로그아웃 엔드포인트 실패 시에도 로컬 세션 파기(legacy 항상 파기)
- [ ] 엣지케이스: 이미 만료/무효 토큰으로 로그아웃 호출해도 정상 종료(멱등)

## 이번 턴 산출물 (MOCK API)

- mock: `src/shared/mocks/handlers/admin-auth.ts` — `POST /admin/auth/logout` handler 추가
- entities: `entities/admin-auth`에 `adminLogout` fetcher + `AdminLogoutResponse` 타입 추가
- (로그아웃 트리거 UI·401 인터셉터 배선은 각각 topbar(M1-3)·보호 API 단위에서 완성)
