# Project Instructions

## Overview

`directg` frontend pnpm workspace (Click-B Start-Kit 기반 제품 모노레포).

앱:

- `apps/directg-client` — Next.js 15 App Router, package `@click-b/directg-client` (고객 포털, SSR/SEO)
- `apps/directg-admin` — Vite + TanStack Router, package `@click-b/directg-admin` (관리자 백오피스, SPA)

공유 패키지는 `packages/*`에 위치한다. (`config`, `types`, `ui`, `hook`, `api-client`, `domain`, `utils`, `logger`, `scripts`)

## Migration

이 저장소의 주 목적은 `../legacy-project`(프레임워크 없는 순수 PHP 스토어 `directg.net`)를 Next.js/React로 **재구현**하는 것이다.

### 유일한 성공 기준: 동작 동일성 (behavior parity)

- legacy의 **화면·데이터·플로우·URL/라우트·폼 필드/검증·세션/인증·결제(PG) 흐름**을 1:1로 재현한다.
- **최적화는 하지 않는다** — 성능, UI/UX, 접근성(a11y), 번들 사이즈, 코드 구조 "개선", 리팩터링, legacy 버그의 임의 수정 모두 **범위 밖**이다. 눈에 띄는 개선 여지가 있어도 legacy 동작을 그대로 옮긴다.
- legacy와 결과가 달라지는 변경은 "개선"이라도 회귀로 간주한다. 의도적 동작 변경이 필요하면 먼저 사용자에게 묻는다.
- SI-Harness의 최적화 성향 도구(`si-optimizer` 등)는 이 프로젝트에서 기본적으로 투입하지 않는다.

### 앱 매핑

| legacy (PHP) | 대상 앱 |
|--------------|---------|
| 스토어프론트 `pc/`·`mobile/` (고객 화면) | `apps/directg-client` (Next.js, SSR/SEO) |
| 관리자 패널 `_Admin_/`·`_Admin2_/` | `apps/directg-admin` (Vite SPA) |

### 원본 참조 (read-only)

- `../legacy-project`의 PHP 코드는 **수정 금지 원본**이다. 참조만 하고 절대 편집하지 않는다.
- 동작 계약·도메인 지식은 legacy 문서를 단일 진실 원천으로 삼는다:
  - `../legacy-project/docs/PROJECT-OVERVIEW.md` — 전체 구조·요청 흐름·페이지 트리 지도
  - `../legacy-project/docs/BUSINESS-RULES.md` 및 `docs/`의 도메인별 계약 문서 (`ORDER-WORKFLOW-AUDIT`, `PAYMENT-APPROVAL`, `MEMBER-LIFECYCLE`, `PARTNER-SETTLEMENT`, `PROMOTION-EVENT-OPS`, `STOCK-MANAGEMENT`, `STATISTICS-REPORTING`, `ADMIN-AUTHORIZATION`, `BOARD-CONTENT`, `SEO-CHANNEL`, `NOTIFICATION-EMAIL`, `OPERATION-POLICY-MAP`)
  - `../legacy-project/CLAUDE.md` — legacy 운영·전환 규칙

### 작업 방식

- 관리자(`_Admin_`) 이관은 프로젝트 스킬 `admin-migration-unit`을, 스토어프론트(`pc/`·`mobile/`) 이관은 `client-migration-unit` 스킬을 사용한다. 두 스킬 모두 공통 원본 스킬 `php-to-nextjs-migration`의 앱 특화 버전이다.
- 한 번에 **한 단위**(화면 1개/공통 컴포넌트 1개/기능 1개)씩 이관한다. 단위당 커밋 1개.
- 데이터는 별도 백엔드 API를 전제로 한다 — 프론트는 `packages/api-client`로만 호출하고, 단위마다 legacy SQL/로직에서 API 계약을 도출해 `docs/migration/`에 기록한다(백엔드 전달용). 백엔드 준비 전에는 MSW mock으로 개발한다.
- **검증 게이트**: 단위 구현 완료 시 parity 보고서를 제시하고 정지한다. `docs/MIGRATION-MAP.md`의 ✅(검증완료)는 **개발자가 legacy와 대조·승인한 뒤에만** 기록하며, 승인 없이 다음 단위를 착수하지 않는다.
- 이관 진행 상태(legacy 화면 ↔ 타겟 라우트 매핑, 완료/검증 여부)는 `docs/MIGRATION-MAP.md`에서 추적한다. 착수·완료 시 갱신한다.

## Renewal (신규 리뉴얼 어드민)

legacy 동작 동일성 이관과 별개로, Figma 기반 리뉴얼 어드민을 `apps/directg-admin` 안에 **별도 경로로 격리해서** 추가한다. (Figma 파일: `다이렉트 게임즈`, 페이지 `[AD] design`, fileKey `DxqbeoDNTxs5WBpqb25APg`)

- 라우트는 `/renewal/*` 접두사 아래에만 추가한다 (`src/routes/renewal/`).
- 리뉴얼 UI 코드는 `src/renewal/` 안에만 둔다. 기존 `screens`/`widgets`/`features`는 수정하지 않는다. 단 하나의 예외: `widgets/layout-shell`의 `/renewal` 분기 한 줄(legacy 사이드바/topbar/footer 우회).
- 기존 코드에서 `src/renewal/`을 import하지 않는다. 리뉴얼에서 기존 `entities`/`shared/api`(API 호출·타입)를 가져다 쓰는 것은 허용한다.
- 리뉴얼 전용 레이아웃(SNB/GNB)과 스타일/토큰은 `src/renewal/` 안에 둔다. 공유 패키지(`packages/*`)는 리뉴얼 때문에 변경하지 않는다.
- `src/renewal/**`에 한해 "UI/UX 개선은 범위 밖" 규칙의 예외로, Figma 디자인이 기준이다. 그 외 영역에는 위 Migration 규칙이 그대로 적용된다.
- 리뉴얼 화면은 MIGRATION-MAP ✅(parity 검증) 대상이 아니다. Figma 프레임 ↔ 화면 매핑은 `docs/renewal/`에 기록한다.
- 리뉴얼 작업은 `stage`에서 딴 별도 브랜치에서 진행한다.

## Commands

```bash
pnpm dev:client        # directg-client 개발 서버 (Next.js)
pnpm dev:admin         # directg-admin 개발 서버 (Vite)
pnpm build             # 전체 빌드
pnpm build:client
pnpm build:admin
pnpm lint              # 전체 ESLint
pnpm format            # Prettier

pnpm --filter @click-b/ui test
pnpm exec tsc -p packages/ui/tsconfig.json --noEmit

# 스캐폴딩 (앱 내부 모듈/패키지 생성)
pnpm scaffold:module --app directg-client
pnpm scaffold:package
pnpm scaffold:doctor --app directg-client
```

## Architecture

- FSD screen layer name is `screens`
- app path aliases use `@app/*` ~ `@shared/*`
- FSD import direction is `app -> screens -> widgets -> features -> entities -> shared`
- same-layer cross-imports are not allowed below widgets; widgets and upper layers may compose cross-slice through public APIs
- app-local code lives under `apps/<app>/src/*`
- shared packages live under `packages/*`
- reusable domain rules live under `packages/domain`

## Dependency Security

`pnpm add` / `pnpm install` / `pnpm update` 또는 `package.json` 의존성 수정 **전에** 반드시 다음을 확인한다.

1. 추가/업그레이드하려는 패키지와 대상 버전이 알려진 공급망 공격(supply-chain attack) 대상인지 점검.
   - npm 페이지, GitHub Security Advisories, Socket.dev, news.hada.io, 보안 블로그(StepSecurity, Snyk 등) 최근 글 검색.
2. 침해 사례(예: 2026 Mini Shai-Hulud — `@tanstack/*`, `@mistralai/*`, `@opensearch-project/*`, `@uipath/*`, `@draftlab/*`, `@draftauth/*`, `safe-action`, `@squawk/*`)와 충돌하는 버전은 절대 설치 금지.
3. CI 와 로컬 모두 `pnpm install --frozen-lockfile` 을 권장한다. lockfile 재생성은 변경 사유와 보안 점검 결과를 함께 보고할 것.
4. 침해 버전이 확인되면 루트 `package.json` 의 `pnpm.overrides` 에 명시적으로 차단하고 안전 버전으로 매핑한다.
5. 의심스러우면 설치/업그레이드 전에 사용자에게 묻는다.

설치 후에는 `node_modules/<pkg>` 와 lockfile 의 실제 버전이 의도한 버전과 일치하는지 확인한다.

> 주의: `apps/directg-admin`은 `@tanstack/react-router`에 의존한다. TanStack 패키지 업그레이드 시 위 침해 사례 점검을 반드시 수행한다.

## Review Guidelines

- GitHub PR 리뷰 코멘트(자동 리뷰 포함)의 제목과 본문은 한국어로 작성한다.
- 심각도 표기는 `P0`, `P1` 형식을 유지한다.
- 파일명, 코드 식별자, API 이름, HTTP 메서드, 에러 메시지는 원문을 유지한다.
- 설명은 원인, 영향, 수정 방향 순서로 짧고 명확하게 작성한다.
