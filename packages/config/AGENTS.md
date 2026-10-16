# @click-b/config

상위 [packages/AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/AGENTS.md)와 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)를 함께 따르되, 충돌 시 [CLAUDE.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/config/CLAUDE.md)를 우선한다.

## 역할

모노레포 전체의 ESLint, TypeScript, Prettier, Tailwind 설정을 중앙 관리하는 설정 전용 패키지다.

## 의존성 규칙

- 허용: 외부 ESLint/Prettier 플러그인만
- 금지: `@click-b/*` 런타임 패키지 전부
- 런타임 코드는 두지 않는다.

## 코드 규칙

- ESLint 설정은 flat config 포맷으로 유지한다.
- 새 설정 경로를 추가하면 `package.json`의 `exports`도 같이 갱신한다.
- 앱은 직접 파일 경로가 아니라 `@click-b/config/...` export 경로만 사용한다.

## 주의사항

- 이 패키지에 React나 유틸리티 같은 런타임 코드를 추가하지 않는다.
- tsconfig, prettier 변경은 워크스페이스 전체에 영향을 주므로 전파 범위를 먼저 점검한다.
