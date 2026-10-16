# @click-b/types

상위 [packages/AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/AGENTS.md)와 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)를 함께 따르되, 충돌 시 [CLAUDE.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/types/CLAUDE.md)를 우선한다.

## 역할

모노레포 전체에서 공유하는 TypeScript 타입 계약과 인프라 레벨 utility type 정의를 소유한다. DAG 최하위 패키지다.

## 의존성 규칙

- 허용: 없음
- 금지: `@click-b/*` 런타임 패키지 전부, 외부 런타임 패키지 전부
- 예외: devDependencies의 `@click-b/config`는 빌드 설정용으로만 허용

## 코드 규칙

- `export type` 중심으로 유지한다.
- 런타임 값 enum, const, class를 두지 않는다.
- 공통 타입은 반복 사용 사례가 입증될 때만 추가한다.
- Zod 스키마는 앱 엔티티 레이어에 둔다.

## 주의사항

- 이 패키지에 런타임 코드를 추가하면 DAG 전체가 오염된다.
- 도메인 엔티티 타입은 앱의 `entities/<name>/type.ts`에 둔다.
