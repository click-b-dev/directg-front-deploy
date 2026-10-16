# @click-b/hook

## 역할

모노레포 전체에서 공유하는 React 커스텀 훅 패키지. 브라우저 상태, 관찰, URL/state 동기화처럼 도메인 무관한 상호작용 로직을 다룬다.

## 의존성 규칙

- **허용:** `@click-b/utils`, `@click-b/types`
- **금지:** `@click-b/ui`, `@click-b/api-client`
- **peerDependencies:** `react ^18.0.0 || ^19.0.0`
- 타입은 `@click-b/types`를 직접 import할 수 있다

## Export 맵

| import 경로                               | 설명                           |
| ----------------------------------------- | ------------------------------ |
| `@click-b/hook`                           | 모든 커스텀 훅의 barrel export |
| `@click-b/hook/use-debounce-value`        | debounce 상태 훅               |
| `@click-b/hook/use-intersection-observer` | 가시성 추적 훅                 |
| `@click-b/hook/use-local-storage`         | localStorage 동기화 훅         |
| `@click-b/hook/use-online-status`         | 온라인 상태 구독 훅            |
| `@click-b/hook/use-query-state`           | query string 동기화 훅         |
| `@click-b/hook/use-resize-observer`       | element 크기 관찰 훅           |
| `@click-b/hook/use-session-storage`       | sessionStorage 동기화 훅       |

## 코드 컨벤션

- 모든 export는 `useXxx` 네이밍
- 훅별 디렉토리 분리: `src/use-debounce-value/`, `src/use-query-state/` 등
- 각 훅은 **도메인 무관** (useDebounce — O / useUserList — X)
- 내부에서 `@click-b/utils`의 순수 함수 활용 가능
- UI 렌더링 로직 포함 금지 (JSX 반환 금지)
- 모듈 책임과 대표 use-case는 `MODULES.md`를 기준으로 유지

## 파일 구조

```
src/
  index.ts              → barrel export
  use-boolean/          → boolean state 훅
  use-click-outside/    → 외부 클릭 감지 훅
  use-copy-to-clipboard/→ 클립보드 복사 훅
  use-countdown-timer/  → 카운트다운 훅
  use-debounce-value/   → debounce 상태 훅
  use-intersection-observer/ → IntersectionObserver 훅
  use-is-client/        → 클라이언트 여부 감지 훅
  use-media-query/      → 미디어 쿼리 훅
  use-multi-selection/  → 멀티 선택 훅
  use-online-status/    → 온라인 상태 훅
  use-pagination/       → 페이지네이션 상태 훅
  use-query-state/      → query string 동기화 훅
  use-resize-observer/  → ResizeObserver 훅
  use-storage/          → local/session storage 훅
```

## 명령어

| 명령어                              | 설명    |
| ----------------------------------- | ------- |
| `pnpm --filter @click-b/hook build` | 훅 빌드 |

## 주의사항

- 도메인 훅(useUserQuery, useProductFilter 등)은 앱의 `entities/<name>/query.ts`에 위치
- React Query 래퍼 훅은 앱의 엔티티 레이어에 위치 (여기 아님)
- `@click-b/ui`를 import하면 DAG 위반
- 새 훅을 추가할 때는 `MODULES.md`에 정의, 대표 use-case, out-of-scope를 함께 기록
