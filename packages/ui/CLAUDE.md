# @click-b/ui

## 역할

모노레포 전체에서 공유하는 Headless UI 컴포넌트.

## 의존성 규칙

- **허용:** `@click-b/types`, `@click-b/utils`
- **금지:** `@click-b/hook`, `@click-b/api-client`
- **peerDependencies:** `react ^18.0.0 || ^19.0.0`

## Export 맵

| import 경로   | 설명                             |
| ------------- | -------------------------------- |
| `@click-b/ui` | 모든 UI 컴포넌트의 barrel export |

## 코드 컨벤션

- **Headless UI 패턴:** 로직만 제공, 스타일은 소비자가 결정
- Tailwind CSS v4 유틸리티 클래스 사용 (인라인 스타일 금지)
- 컴포넌트별 디렉토리 구조:
  ```
  src/<component>/
    <Component>.tsx     → 컴포넌트 구현
    types.ts            → Props 타입
    index.ts            → barrel export
  ```
- Props 타입에 `className` 포함 — Tailwind 커스터마이징 허용
- 데이터 페칭 금지 — API 호출은 소비자 책임

## 파일 구조

```
src/
  index.ts              → barrel export
  button/
    Button.tsx
    types.ts
    index.ts
  input/
    Input.tsx
    types.ts
    index.ts
  modal/
    Modal.tsx
    types.ts
    index.ts
```

## 명령어

| 명령어                            | 설명          |
| --------------------------------- | ------------- |
| `pnpm --filter @click-b/ui build` | 컴포넌트 빌드 |

## 주의사항

- 이 패키지의 컴포넌트는 **도메인 무관** (Button, Input, Modal — O / UserCard, ProductList — X)
- 도메인 컴포넌트는 앱의 `features/<name>/ui/`에 위치
- `@click-b/hook`을 import하면 DAG 위반 — 훅이 필요하면 컴포넌트 내부에서 직접 작성하거나 `@click-b/utils`의 순수 함수 활용
