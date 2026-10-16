# @click-b/hook

상위 [packages/AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/AGENTS.md)와 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)를 함께 따르되, 충돌 시 [CLAUDE.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/hook/CLAUDE.md)를 우선한다. 새 훅 추가 시 [MODULES.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/hook/MODULES.md)도 같이 갱신한다.

## 역할

모노레포 전체에서 공유하는 React 커스텀 훅 패키지다. 도메인 무관한 상호작용 로직만 다룬다.

## 의존성 규칙

- 허용: `@click-b/utils`, `@click-b/types`
- 금지: `@click-b/ui`, `@click-b/api-client`
- peerDependencies: `react ^18.0.0 || ^19.0.0`

## 코드 규칙

- 모든 export는 `useXxx` 네이밍을 따른다.
- 훅별 디렉토리를 분리한다.
- JSX 반환 금지. UI 렌더링 로직은 포함하지 않는다.
- 내부에서 `@click-b/utils`의 순수 함수는 활용 가능하다.

## 주의사항

- 도메인 훅과 React Query 래퍼 훅은 앱 엔티티 레이어에 둔다.
- `@click-b/ui`를 import하면 DAG 위반이다.
