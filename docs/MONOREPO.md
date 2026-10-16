# directg 모노레포 관리 가이드

> `directg` 프론트엔드 pnpm 워크스페이스(Click-B Start-Kit 기반)를 어떻게 운영·관리하는지 정의한다.
> 프로젝트 지침의 단일 진입 문서는 루트 `CLAUDE.md` → `AGENTS.md`이며, 이 문서는 그 운영 세부를 보완한다.

## 1. 저장소 개요

pnpm workspace 기반 모노레포. 두 개의 앱과 아홉 개의 공유 패키지로 구성된다.

```
directg-front/
├── apps/
│   ├── directg-client/   # @click-b/directg-client — Next.js 15 App Router (고객 포털, SSR/SEO)
│   └── directg-admin/    # @click-b/directg-admin  — Vite + TanStack Router (관리자 백오피스, SPA)
├── packages/
│   ├── types/            # @click-b/types      — 최하위 타입 계약
│   ├── utils/            # @click-b/utils      — 프레임워크 비의존 유틸리티
│   ├── hook/             # @click-b/hook       — React 훅 (JSX 미반환)
│   ├── ui/               # @click-b/ui         — headless UI + 접근성 상호작용
│   ├── api-client/       # @click-b/api-client — 인프라 레벨 HTTP 클라이언트
│   ├── domain/           # @click-b/domain     — 재사용 도메인 규칙
│   ├── config/           # @click-b/config     — eslint/ts 등 설정 파일
│   ├── logger/           # @click-b/logger     — 로깅
│   └── scripts/          # @click-b/scripts    — CLI / 스캐폴딩
├── pnpm-workspace.yaml   # workspace glob: apps/*, packages/*
├── package.json          # 루트 스크립트 + 공통 devDependencies
├── tsconfig.base.json    # 공통 TS 설정
├── eslint.config.js      # 루트 flat config
└── prettier.config.js
```

- **패키지 매니저**: pnpm `10.30.3` (`packageManager` 필드로 고정). corepack 사용 권장.
- **모듈 시스템**: 런타임 패키지는 **ESM 전용**.
- **워크스페이스 참조**: 앱은 공유 패키지를 `"workspace:*"` 프로토콜로만 참조한다.

## 2. 초기 셋업

```bash
corepack enable                    # pnpm 10.30.3 활성화
pnpm install --frozen-lockfile     # lockfile 기준 정확 재현 설치
```

- 최초 클론 후 반드시 `--frozen-lockfile`로 설치해 lockfile 무결성을 검증한다.
- `prepare` 스크립트가 husky Git 훅을 설치한다(자동 실행).

## 3. 일상 명령어

루트에서 실행하는 것을 기본으로 한다.

| 목적 | 명령 |
|------|------|
| 클라이언트 개발 서버 | `pnpm dev:client` |
| 어드민 개발 서버 | `pnpm dev:admin` |
| 전체 빌드 | `pnpm build` (`pnpm -r build`) |
| 개별 빌드 | `pnpm build:client` / `pnpm build:admin` |
| 전체 린트 | `pnpm lint` / 자동수정 `pnpm lint:fix` |
| 포맷 | `pnpm format` / 검사 `pnpm format:check` |

특정 패키지만 대상으로 실행할 때는 `--filter`를 사용한다.

```bash
pnpm --filter @click-b/ui test
pnpm --filter @click-b/directg-client build
pnpm exec tsc -p packages/ui/tsconfig.json --noEmit
```

## 4. 아키텍처 규칙 (FSD)

두 앱 모두 Feature-Sliced Design을 따른다. screen 레이어 이름은 **`screens`**로 통일한다.

**임포트 방향(단방향)**:

```
app → screens → widgets → features → entities → shared
```

- 앱 로컬 코드는 `apps/<app>/src/*`, 경로 별칭은 `@app/*` ~ `@shared/*`.
- `widgets` 아래 레이어는 **같은 레이어 간 cross-import 금지**.
- `widgets` 이상 레이어는 public API를 통해서만 cross-slice 조합 가능.
- 재사용 도메인 규칙은 `packages/domain`에 둔다(앱에 중복 소유 금지).

**앱별 라우팅 차이**:
- `directg-client`: Next.js App Router → `src/app/` 라우팅.
- `directg-admin`: TanStack Router → `src/routes/` + 생성물 `routeTree.gen.ts`(수동 편집 금지).

## 5. 패키지 의존성 경계

패키지 간 DAG(방향성 비순환 그래프)를 유지한다. 상세 규칙은 `packages/AGENTS.md`와 각 `packages/<name>/CLAUDE.md`가 원본이다.

| 패키지 | 소유 범위 | 금지 |
|--------|-----------|------|
| `types` | 최하위 타입 계약 | 런타임 코드 |
| `utils` | 프레임워크 비의존 유틸 | React/DOM 의존 |
| `hook` | React 훅 | JSX 반환 |
| `ui` | headless UI, 접근성 | 앱 도메인 로직 |
| `api-client` | HTTP 클라이언트(인프라) | 도메인 규칙 |
| `domain` | 재사용 도메인 규칙 | 프레임워크 결합 |
| `config` | 설정 파일 | 런타임 로직 |
| `scripts` | CLI/스캐폴딩 | 앱 코드 소유 |

**핵심 원칙**:
- 공유 패키지는 앱 도메인 로직을 직접 소유하지 않는다.
- `package.json`의 `exports`와 실제 공개 API가 **항상 일치**해야 한다. 새 public 엔트리 추가 시 타입 엔트리와 문서를 함께 갱신한다.
- 테스트·예제 코드가 패키지 DAG를 우회하지 않도록 한다.

## 6. 스캐폴딩

`@click-b/scripts` CLI로 앱 모듈·패키지를 생성한다. 각 앱은 `.scaffold-manifest.json`에 적용된 preset/module/domain 이력을 기록한다(수동 편집 지양).

```bash
pnpm scaffold:module --app directg-client   # 앱 내부 모듈 생성
pnpm scaffold:package                        # 새 공유 패키지 생성
pnpm scaffold:doctor --app directg-client    # 스캐폴드 상태 점검
```

- `MODULES.md`가 있는 패키지는 새 모듈 추가 시 해당 파일도 갱신한다.
- 새 패키지 생성 후 루트 `tsconfig.base.json` 경로 및 소비 측 `workspace:*` 참조를 확인한다.

## 7. 코드 품질 게이트

- **Git 훅**: husky + lint-staged. 커밋 시 스테이징된 `**/*.{js,ts,tsx}`에 `eslint --fix` 자동 적용.
- **린트**: 루트 flat config(`eslint.config.js`) + `@click-b/config` 제공 규칙. 커밋 전 `pnpm lint` 통과 권장.
- **포맷**: Prettier(`prettier.config.js`). `pnpm format:check`로 CI 검증.
- **타입체크**: 패키지별 `tsc --noEmit`. 빌드 전 타입 오류 0 유지.

> `config` 패키지의 eslint 규칙 변경 시: `pnpm config:eslint:build` → `pnpm config:eslint:typecheck`.

## 8. 의존성 보안 (필수)

`pnpm add` / `install` / `update` 또는 `package.json` 의존성 수정 **전에** 반드시 점검한다.

1. 추가·업그레이드 대상 패키지·버전이 알려진 공급망 공격 대상인지 확인(npm, GitHub Security Advisories, Socket.dev, 보안 블로그).
2. 침해 사례(예: 2026 Mini Shai-Hulud — `@tanstack/*`, `@mistralai/*`, `@opensearch-project/*` 등)와 충돌하는 버전은 **설치 금지**.
3. CI·로컬 모두 `pnpm install --frozen-lockfile` 사용. lockfile 재생성은 변경 사유·보안 점검 결과를 함께 보고.
4. 침해 버전 확인 시 루트 `package.json`의 `pnpm.overrides`로 차단하고 안전 버전으로 매핑.
5. 의심스러우면 설치 전에 확인을 받는다.

> ⚠️ `directg-admin`은 `@tanstack/react-router`에 의존한다. TanStack 패키지 업그레이드 시 위 점검을 반드시 수행한다.

설치 후 `node_modules/<pkg>`와 lockfile의 실제 버전이 의도와 일치하는지 확인한다.

## 9. 빌드 · 배포

- **의존 순서**: `pnpm -r build`가 워크스페이스 DAG를 따라 패키지 → 앱 순으로 빌드한다.
- **client**: Next.js 15 프로덕션 빌드(SSR/SEO 대응).
- **admin**: Vite 정적 SPA 번들.
- 앱 단독 빌드는 `--filter`가 의존 패키지를 자동 포함한다.
- 릴리스 전 체크리스트: `pnpm install --frozen-lockfile` → `pnpm lint` → 타입체크 → `pnpm build`.

## 10. 변경 작업 원칙

- **패키지 API 변경**: `exports` + 타입 + 소비 앱 + 문서를 한 커밋 범위에서 함께 갱신.
- **레이어 이동**: FSD 임포트 방향 위반 여부를 `pnpm lint`로 검증.
- **공통 설정 변경**(`tsconfig.base.json`, `eslint.config.js`, `prettier.config.js`): 전 워크스페이스 영향 → 전체 빌드·린트로 회귀 확인.
- **문서 원본**: 프로젝트 규칙은 `CLAUDE.md`/`AGENTS.md`, 패키지 규칙은 각 `packages/<name>/CLAUDE.md`가 원본. `AGENTS.md`는 Codex 등 타 도구용 어댑터이므로 원본 수정 시 함께 동기화한다.
