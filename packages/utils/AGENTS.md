# @click-b/utils

상위 [packages/AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/AGENTS.md)와 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)를 함께 따르되, 충돌 시 [CLAUDE.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/utils/CLAUDE.md)를 우선한다. 새 모듈 추가 시 [MODULES.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/utils/MODULES.md)도 같이 갱신한다.

## 역할

모노레포 전체에서 공유하는 범용 유틸리티 함수 패키지다. 기본은 순수 함수이며 일부 모듈만 브라우저 API를 얇게 감싼다.

## 의존성 규칙

- 허용: `@click-b/types`
- 금지: `@click-b/ui`, `@click-b/hook`, `@click-b/api-client`, React, Node.js API

## 코드 규칙

- 순수 함수를 기본값으로 유지한다.
- React, 앱 프레임워크, Node 특화 코드는 두지 않는다.
- DOM 직접 사용은 `cookie`, `storage`, `url` 같은 전용 래퍼 모듈로 제한한다.
- `useXxx` 패턴 함수는 여기서 만들지 않는다.

## 주의사항

- React Hook은 `@click-b/hook`에 둔다.
- 비즈니스 로직은 앱의 엔티티 또는 `shared/lib`에 둔다.
