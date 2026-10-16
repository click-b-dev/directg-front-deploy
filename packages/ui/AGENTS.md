# @click-b/ui

상위 [packages/AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/AGENTS.md)와 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)를 함께 따르되, 충돌 시 [CLAUDE.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/ui/CLAUDE.md)를 우선한다.

## 역할

모노레포 전체에서 공유하는 headless UI 컴포넌트를 소유한다.

## 의존성 규칙

- 허용: `@click-b/types`, `@click-b/utils`
- 금지: `@click-b/hook`, `@click-b/api-client`
- peerDependencies: `react ^18.0.0 || ^19.0.0`

## 설계 규칙

- Headless UI 패턴을 유지한다. 스타일은 소비자가 결정한다.
- Tailwind CSS v4 유틸리티 기준으로 작성하되, 컴포넌트 자체에 강한 시각 결합을 넣지 않는다.
- Props 타입에는 `className`을 포함한다.
- 데이터 페칭은 금지한다.

## 주의사항

- 도메인 무관 컴포넌트만 둔다.
- 도메인 컴포넌트는 앱의 `features/<name>/ui/`에 둔다.
- 훅이 필요하면 `@click-b/hook`을 import하지 말고 패키지 내부 로직 또는 `@click-b/utils`를 활용한다.

## 추가 참조

- 접근성 중심 컴포넌트 구현 시 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)의 `@click-b/ui` 섹션을 우선 따른다.
- Codex에서는 `.codex/skills/create-machine/SKILL.md`, `.codex/skills/create-component/SKILL.md`를 먼저 보고, 세부 원문은 `.claude/skills/create-machine.md`, `.claude/skills/create-component.md`를 archive로 참고한다.
