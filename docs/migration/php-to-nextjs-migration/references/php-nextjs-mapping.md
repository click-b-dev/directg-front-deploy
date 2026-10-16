# 10단계 절차 + PHP↔Next.js 매핑

## 마이그레이션 10단계 절차

전체 프로젝트 진입 시 이 순서로 분석·설계한다. 개별 단위 작업은 SKILL.md의 4단계 루프를 따른다.

1. **프로젝트 구조 분석** — 진입 파일, 공통 설정, DB 연결, Session, 공통 Header/Footer
2. **화면 분석** — 페이지별 URL/Method/Param/Session/DB/출력 정리 (분석 템플릿 §1)
3. **Request Flow 분석** — Browser→PHP→Parsing→Logic→DB→Render→Browser
4. **의존성 분석** — include/require/config/common/util/helper, Dependency Diagram
5. **Database 분석** — Table/JOIN/Transaction/SP/Trigger, CRUD
6. **Session 분석** — 로그인/권한/관리자/생성/삭제
7. **화면 Component 분석** — Header/Nav/Sidebar/Content/Footer 분리
8. **Next.js 구조 설계** — 아래 구조 예시. 프로젝트 규칙(FSD 등) 있으면 그에 맞춤
9. **API 분리** — PHP의 View+Logic+SQL 혼재를 역할별로 분리 (B 토폴로지: 프론트에 API를 만드는 대신 **API 계약을 도출해 `docs/migration/`에 기록**하고 백엔드에 전달)
10. **기능 구현** — Layout→공통Component→로그인→목록→상세→등록→수정→삭제→업로드→관리자

## Next.js 구조 예시

```
app/
  login/
  board/
  components/
  apis/
  hooks/
  stores/
  types/
```

> 프로젝트에 FSD 등 별도 규칙이 있으면 그 구조에 맞게 설계한다. (참조 가드: 프로젝트 `.claude/references/`·`AGENTS.md`가 있으면 우선)
> directg-front는 FSD(`app → screens → widgets → features → entities → shared`)를 쓰고, 위 `apis/` 대신 `packages/api-client`로 백엔드를 호출한다. 프론트에 Route Handler/Repository/DB 계층을 만들지 않는다.

## API 분리 원칙

PHP는 한 파일(`login.php`)에 View + Business Logic + SQL이 모두 섞여 있는 경우가 많다.
Next.js에서는 역할을 분리한다. **데이터 접근 토폴로지에 따라 분리 지점이 다르다** (SKILL.md의 "데이터 접근 토폴로지" 참고):

**A. 직접 접근형** — 프론트가 DB를 직접 쥔다:

```
Page → Server Action / API Route → Service → Repository → Database
```

- **Page**: 렌더링만
- **Server Action / Route Handler**: 요청 파싱, 입력 검증
- **Service**: 비즈니스 로직
- **Repository**: DB 접근 (기존 SQL 그대로)

**B. 백엔드 분리형** — 프론트는 DB를 만지지 않고 별도 백엔드 API만 호출한다 (directg-front):

```
Page → api-client fetcher → [경계] → 별도 백엔드 (계약 구현: Logic + SQL)
```

- **Page**: 렌더링만
- **api-client fetcher**: 요청/응답 타입에 맞춰 백엔드 호출 (프론트에 SQL·비즈니스 로직 없음)
- **API 계약**: legacy의 View+Logic+SQL을 분석해 요청/응답 스키마·검증·에러·상태코드로 도출 → `docs/migration/`에 문서로 남겨 백엔드에 전달
- **MSW mock**: 백엔드 미완이면 계약대로 mock을 만들어 프론트를 먼저 개발
- SQL은 프론트로 옮기지 않는다. legacy SQL의 **결과 동작**(계산/필터/정렬/널 처리)만 계약에 반영한다.

## PHP ↔ Next.js 전체 매핑

| PHP | Next.js | 비고 |
|-----|---------|------|
| `include` | Component | 공통 UI는 Component로 |
| `require` | `import` | |
| `echo` | JSX | |
| `$_GET` | `searchParams` | |
| `$_POST` | `request.formData()` / `request.json()` | |
| `$_COOKIE` | `cookies()` | |
| `$_SESSION` | Session / JWT | **이관 마지막에** 전환 (철칙 5). B: 인증도 백엔드 API 계약으로 |
| `header()` (Location) | `redirect()` | 리다이렉트 동작 동일하게 |
| `PDO` | A: Repository / B: API 계약 → `api-client` fetcher | 기존 SQL 그대로(A) / SQL은 프론트로 안 옮김(B), 철칙 6 |
| `HTML` | React Component | |

## 매핑 시 주의

- `header()`로 보내던 상태코드·리다이렉트 경로를 **그대로** 재현한다.
- `$_GET`/`$_POST` 파라미터 이름과 타입 변환(문자열→숫자 등) 동작을 동일하게.
- PHP의 암묵적 형변환/널 처리로 생기던 결과를 그대로 재현해야 parity가 맞는다.
