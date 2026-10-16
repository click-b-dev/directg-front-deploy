---
name: php-to-nextjs-migration
description: Use when migrating an existing/operational PHP service to Next.js — porting PHP pages, functions, APIs, sessions, or DB access to Next.js while keeping behavior identical. Triggers on phrases like "PHP 마이그레이션", "PHP를 Next.js로", legacy `.php` files alongside a Next.js `app/` directory, or when asked to reproduce a PHP screen in React/Next.js.
---

# PHP → Next.js 마이그레이션

## 개요

**운영 중인 PHP 서비스를 Next.js로 이관한다. 목표는 새 기능 개발이 아니라 기존 동작을 동일하게 유지하면서 기술 스택만 바꾸는 것이다.**

모든 변경의 합격 기준은 단 하나: **기능 동일성(Function Parity)**. "더 낫게"가 아니라 "똑같이"가 정답이다.

이 스킬은 운영 서비스 이관 작업이다. 반드시 **작은 단위로, 분석 후, 검증과 함께** 진행한다.

**선행 조건:** PHP 옆에 Next.js(`app/`)가 아직 없다면 먼저 `php-to-nextjs-setup` 스킬로 공존 환경을 구축한다. 이 스킬은 환경이 이미 준비됐다고 가정한다. (프로젝트가 별도 모노레포로 legacy를 read-only 참조하며 재구현하는 형태여도 동일하게 적용된다 — 공존/재구현 여부와 무관하게 단위 루프는 같다.)

## 데이터 접근 토폴로지 (가장 먼저 판별)

이관 대상마다 **프론트가 DB를 직접 쥐는지**를 먼저 판별한다. 이후 모든 설계·철칙 해석이 여기서 갈린다.

- **A. 직접 접근형** — Next.js가 DB에 직접 연결(PDO 대체 Repository → Database). PHP의 SQL을 그대로 옮겨 재현한다.
- **B. 백엔드 분리형** — 프론트는 DB를 만지지 않고 별도 백엔드 API만 호출한다. PHP의 SQL/비즈니스 로직은 옮기는 게 아니라 **API 계약으로 도출**해 백엔드에 넘긴다. 프론트는 그 계약을 호출하는 클라이언트만 구현한다.

> **directg-front는 B(백엔드 분리형)**다. 프론트는 `packages/api-client`로만 데이터를 호출하고, DB/SQL 코드는 프론트에 존재하지 않는다. 단위마다 legacy SQL/로직에서 API 계약을 도출해 `docs/migration/`에 기록하고(백엔드 전달용), 백엔드 준비 전에는 MSW mock으로 개발한다. → 아래 철칙 4·6과 매핑표의 `PDO`·`$_SESSION` 행은 B 기준으로 해석한다.

## 철칙 (타협 불가)

1. **기능보다 동작을 우선한다.** 새 기능을 추가하지 않는다. 기존 화면과 동일한 결과 출력이 최우선.
2. **작은 단위로 이전한다.** 한 번에 전체를 바꾸지 않는다. 단위: Page → Function → API → Component.
3. **이해 후 변경한다.** Request / Business Logic / Database / Session / Response를 모두 파악하기 전까지 코드를 수정하지 않는다.
4. **DB Schema를 변경하지 않는다.** Table / Column / Index를 건드리지 않는다. 스키마 변경은 별도 프로젝트. (B 토폴로지: 프론트에 스키마가 없으므로, 도출한 API 계약이 legacy 스키마를 임의로 바꾸도록 요구하지 않는다.)
5. **Session 구조를 먼저 바꾸지 않는다.** 인증 체계에 영향을 주므로 가장 마지막에 수행한다.
6. **SQL을 먼저 최적화하지 않는다.** 기존 SQL을 그대로 옮겨 동일성 확보 후, 최적화는 이관 완료 이후 별도 단계. (B 토폴로지: SQL을 프론트로 옮기지 않는다 — legacy SQL의 결과·계산·필터 동작을 **있는 그대로** API 계약으로 기술하고, 최적화·정규화 제안을 섞지 않는다.)

**규칙의 문구를 어기는 것은 규칙의 정신을 어기는 것이다.** "어차피 더 좋아지니까", "지금 같이 고치는 게 효율적"이라는 생각이 들면 멈춘다 — 그건 별도 작업이다.

## Red Flags — 멈추고 다시 생각하라

- "이왕 옮기는 김에 UI/구조도 개선하자" → ❌ 별도 작업. 동작만 옮긴다.
- "스키마가 이상하니 컬럼 하나만 바꾸자" → ❌ 철칙 4 위반.
- "세션을 JWT로 바꾸면서 같이 가자" → ❌ 가장 마지막. 지금은 기존 세션 동작 재현만.
- "이 SQL 비효율적이니 고쳐서 옮기자" → ❌ 동일 SQL 먼저. 최적화는 나중에.
- "페이지 5개를 한 커밋에 옮기자" → ❌ 한 단위 = 한 커밋. parity 검증 가능한 크기로.
- "원본 PHP 동작은 대충 알겠으니 바로 짜자" → ❌ 철칙 3. 분석 먼저.

## 언제 사용하는가 / 사용하지 않는가

**사용:** 운영 중인 PHP 서비스의 화면/기능/API/컴포넌트를 Next.js로 이관할 때.

**사용 안 함:** 신규 기능 개발(`/si-dev` 등), 스키마 재설계, 성능 최적화 단독 작업 — 이관 완료 후 별도로.

## 작업 단위 라우팅

요청을 받으면 먼저 **이관 단위**를 분류한다. 한 번에 하나만.

| 단위 | 무엇을 옮기나 | 산출물 (A 직접접근형) | 산출물 (B 백엔드 분리형) |
|------|--------------|--------|--------|
| **Page** | 화면 1개 (`board.php` → `app/board/[id]/page.tsx`) | 페이지 + 필요한 component/api | 페이지 + api-client 호출 + 필요한 component |
| **Function** | 단일 기능 (목록/상세/등록/수정/삭제 등) | service + repository + UI 바인딩 | API 계약 문서 + api-client fetcher + UI 바인딩 (+ MSW mock) |
| **API** | 엔드포인트 1개 (PHP에 섞인 View/Logic/SQL 분리) | Server Action / Route Handler | `docs/migration/`의 API 계약 (백엔드 전달용) + 프론트 호출부 |
| **Component** | 공통 UI 1개 (Header/Nav/Sidebar/Footer) | React Component | React Component |

단위가 불명확하면 **가장 작은 단위(Component 또는 단일 Function)**부터 시작한다.

> **B 토폴로지 주의:** "API" 단위는 프론트에 Route Handler를 만드는 게 아니라, legacy의 View+Logic+SQL에서 **API 계약(요청/응답 스키마, 검증, 에러, 상태코드)을 도출해 문서로 남기는 것**이 산출물이다. 백엔드가 그 계약을 구현하고, 프론트는 `api-client`로 호출한다. directg-front는 이 계약을 `docs/migration/`에 기록한다.

## 단위별 마이그레이션 루프 (체이닝)

각 단위마다 아래 4단계를 **순차로** 밟는다. 분석을 건너뛰고 구현으로 점프하지 않는다.

```
1. 분석   원본 PHP의 Request/Logic/DB/Session/Response를 채운다
   ↓      → references/page-analysis-template.md 사용
2. 설계   Next.js 구조에 매핑한다
   ↓      A: Page/Action/Service/Repository
   ↓      B: Page/UI + API 계약 도출(→ docs/migration/에 기록) + api-client fetcher
   ↓      → references/php-nextjs-mapping.md 사용
3. 구현   동작을 그대로 재현한다. 새 기능·개선 금지
   ↓      B: 백엔드 미완이면 MSW mock으로 계약대로 개발
   ↓      한 단위 완료 = 한 커밋 (작게, 되돌리기 쉽게)
4. 검증   기존 화면과 결과가 동일한지 확인한다 (Function Parity)
   ↓      → references/parity-checklist.md 사용
5. 게이트 parity 보고서를 제시하고 정지한다. MIGRATION-MAP의 ✅(검증완료)는
          개발자가 legacy와 대조·승인한 뒤에만 기록. 승인 없이 다음 단위 착수 금지.
```

**한 단위가 5단계를 통과하기 전에는 다음 단위로 넘어가지 않는다.** (검증 게이트는 프로젝트 지침 `AGENTS.md`와 동일 — 개발자 승인 전까지 정지)

## 권장 구현 순서 (전체 프로젝트)

처음 프로젝트에 진입하면 이 순서로 진행한다:
프로젝트 구조 분석 → Request 분석 → DB 분석 → Session 분석 → Component 분리 → Next.js 구조 설계 → 공통 UI → 페이지 → API → 기능 테스트 → 배포.

기능 구현 세부 순서: Layout → 공통 Component → 로그인 → 목록 → 상세 → 등록 → 수정 → 삭제 → 파일 업로드 → 관리자.

## PHP ↔ Next.js 빠른 매핑

| PHP | Next.js |
|-----|---------|
| `include` | Component |
| `require` | `import` |
| `echo` | JSX |
| `$_GET` | `searchParams` |
| `$_POST` | `request.formData()` / `request.json()` |
| `$_COOKIE` | `cookies()` |
| `$_SESSION` | Session / JWT (이관 마지막) |
| `header()` | `redirect()` |
| `PDO` | A: Repository / **B: API 계약 → `api-client` fetcher** (프론트에 SQL 없음) |
| `HTML` | React Component |

전체 매핑·단계별 절차 → `references/php-nextjs-mapping.md`

## 참조 파일

- `references/page-analysis-template.md` — 페이지/Request Flow/DB/Session 분석 템플릿
- `references/php-nextjs-mapping.md` — 10단계 절차 + 전체 매핑표
- `references/parity-checklist.md` — 기능 동일성 검증 체크리스트 + 완료 기준
- `rules/` — 대상 프로젝트에 복사해 넣는 가드(CLAUDE.md 규칙 + 선택적 hook). `rules/README.md` 참고.

**프로젝트 참조 가드:** 대상 프로젝트에 `AGENTS.md`/`CLAUDE.md`나 `docs/MIGRATION-MAP.md`가 있으면 그 지침이 우선한다. directg-front의 경우 이관 상태는 `docs/MIGRATION-MAP.md`에서 추적하고, 도출한 API 계약은 `docs/migration/`에 기록한다.

## 완료 기준

모두 만족해야 이관 완료로 판단:
- 모든 화면이 동일하게 동작 / 모든 CRUD 정상 동작
- 인증·권한이 동일하게 동작 / DB 변경 없이 운영 (B: 백엔드가 legacy 스키마·데이터를 그대로 사용)
- 기존 UX 유지 / 기능 회귀(Regression) 없음
- (B) 각 단위의 API 계약이 `docs/migration/`에 기록되고, `docs/MIGRATION-MAP.md`의 ✅가 개발자 승인으로 채워짐
