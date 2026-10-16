# @click-b/hook Modules

`@click-b/hook`은 모노레포 전역에서 재사용하는 React 커스텀 훅 패키지다. 이 문서는 개발자와 AI 도구가 각 훅의 책임, 대표 use-case, 경계를 빠르게 파악하도록 모듈 계약을 정리한다.

## 원칙

- 이 패키지는 도메인 로직이 아니라 범용 UI 상호작용과 브라우저 상태 동기화만 다룬다.
- 라우터, 서버 상태, 비즈니스 규칙은 앱/엔티티 레이어에 두고 여기에는 재사용 가능한 hook primitive만 둔다.
- 훅이 브라우저 API를 사용하더라도 SSR 안전성과 cleanup을 기본 전제로 한다.
- 모듈 의도가 중요한 경우 루트 import보다 subpath import를 우선한다.

## 인터페이스 규칙

- 각 훅 문서에는 "정의 / 공개 API / 인터페이스 / use-case / 경계"를 함께 유지한다.
- 반환값이 tuple인지 object인지 문서에서 명확히 구분한다.
- setter가 `SetStateAction`을 받는지, callback ref를 쓰는지 같은 사용 규칙을 시그니처에 명시한다.
- 브라우저 이벤트와 SSR snapshot 전략이 있는 훅은 그 동작 계약도 적는다.

## 모듈 맵

| 모듈                        | import 경로                               | 책임                               | 대표 use-case                            | 제외 범위                    |
| --------------------------- | ----------------------------------------- | ---------------------------------- | ---------------------------------------- | ---------------------------- |
| `use-debounce-value`        | `@click-b/hook/use-debounce-value`        | debounce된 상태 반영               | 검색어, 슬라이더, 고비용 계산 트리거     | 서버 요청 자체               |
| `use-intersection-observer` | `@click-b/hook/use-intersection-observer` | 요소 가시성 관찰                   | infinite scroll, lazy render, impression | 정밀 픽셀 측정               |
| `use-resize-observer`       | `@click-b/hook/use-resize-observer`       | 요소 크기 변화 관찰                | 차트 리사이즈, 컨테이너 기반 레이아웃    | CSS만으로 해결 가능한 반응형 |
| `use-online-status`         | `@click-b/hook/use-online-status`         | 브라우저 online/offline 상태 구독  | 오프라인 배너, 재시도 UX 힌트            | 서버 가용성 판정             |
| `use-query-state`           | `@click-b/hook/use-query-state`           | query string과 state 동기화        | 검색, 필터, 페이지네이션 상태 공유       | 라우터 의존 탐색 로직        |
| `use-storage`               | `@click-b/hook`                           | local/session storage state 동기화 | theme, 임시 draft, 탭 범위 상태          | 민감 정보 저장               |
| `use-media-query`           | `@click-b/hook`                           | media query 구독                   | breakpoint 분기                          | 복잡한 layout 계산           |
| `use-click-outside`         | `@click-b/hook`                           | 외부 클릭 감지 및 레이어 스택 처리 | dropdown, popover, modal close           | focus trap                   |
| `use-pagination`            | `@click-b/hook`                           | offset pagination state            | page/limit 제어, 이전/다음 이동          | 실제 데이터 fetch            |
| `use-countdown-timer`       | `@click-b/hook`                           | 잔여 시간 카운트다운               | OTP, 재전송 제한 타이머                  | 서버 시간 동기화             |
| `use-boolean`               | `@click-b/hook`                           | 단순 boolean state 조작            | open/close, toggle UI                    | 복합 상태 머신               |
| `use-is-client`             | `@click-b/hook`                           | 클라이언트 렌더 여부 판정          | hydration 이후 전용 UI                   | 브라우저 capability 검사     |
| `use-copy-to-clipboard`     | `@click-b/hook`                           | 클립보드 복사 + copied state       | 복사 버튼, 코드 스니펫 UX                | 권한 정책 처리               |
| `use-multi-selection`       | `@click-b/hook`                           | 리스트/테이블 멀티 선택            | bulk action UI                           | 서버 동기화 정책             |

## `use-debounce-value`

### 정의

입력 상태의 반영을 지연시키는 훅이다. UI 입력은 즉시 발생하지만, 반환값은 delay 이후에만 바뀌므로 부수효과 트리거 빈도를 줄이는 데 적합하다.

### 공개 API

- `useDebounceValue(initialValue, delay?)`

### 인터페이스

```ts
type UseDebounceValueSetter<T> = React.Dispatch<React.SetStateAction<T>>;

function useDebounceValue<T>(initialValue: T, delay?: number): [T, UseDebounceValueSetter<T>];
```

### 대표 use-case

- 검색어 입력 후 API 호출 시점을 늦추고 싶을 때
- slider, range, filter 입력이 너무 잦아 계산 비용이 클 때

### 경계

- `useDeferredValue` 대체가 아니다.
- 실제 API retry나 cancelation은 별도 레이어가 맡는다.

## `use-intersection-observer`

### 정의

`IntersectionObserver` 보일러플레이트를 감싼 가시성 추적 훅이다.

### 공개 API

- `useIntersectionObserver(options?)`
- `UseIntersectionObserverOptions`

### 인터페이스

```ts
interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
}

function useIntersectionObserver<T extends Element>(
  options?: UseIntersectionObserverOptions,
): {
  ref: (node: T | null) => void;
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
};
```

### 대표 use-case

- 무한 스크롤 sentinel 감지
- lazy mount / lazy load
- 1회성 노출 추적

### 경계

- exact pixel 계산이나 복잡한 viewport math는 하지 않는다.
- analytics 중복 방지는 호출 측 정책이다.

## `use-resize-observer`

### 정의

`ResizeObserver` 기반 element size 구독 훅이다.

### 공개 API

- `useResizeObserver({ ref, box? })`
- `UseResizeObserverOptions`

### 인터페이스

```ts
interface UseResizeObserverOptions<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  box?: ResizeObserverBoxOptions;
}

function useResizeObserver<T extends HTMLElement>(
  options: UseResizeObserverOptions<T>,
): {
  width?: number;
  height?: number;
};
```

### 대표 use-case

- 차트/캔버스 리사이즈
- 컨테이너 폭 기준 렌더 분기
- 가상 리스트 측정 보조

### 경계

- CSS container query로 풀 수 있는 문제를 먼저 JS로 풀지 않는다.

## `use-online-status`

### 정의

브라우저의 `online` / `offline` 이벤트를 외부 store처럼 구독하는 작은 훅이다.

### 공개 API

- `useOnlineStatus()`

### 인터페이스

```ts
function useOnlineStatus(): boolean;
```

### 대표 use-case

- 오프라인 배너
- 재시도 버튼 비활성화/안내
- optimistic mutation UX 힌트

### 경계

- `navigator.onLine`은 실제 인터넷/API 서버 연결을 보장하지 않는다.

## `use-query-state`

### 정의

query string과 React 상태를 동기화하는 router-agnostic 훅이다. parsing과 serialization은 `@click-b/utils/search-params`에 위임한다.

### 공개 API

- `useQueryState(schema, options?)`
- `UseQueryStateOptions`

### 인터페이스

```ts
interface UseQueryStateOptions<T extends Record<string, unknown>> {
  buildOptions?: BuildSearchParamsOptions;
  defaultHistory?: "push" | "replace";
  initialState?: Partial<T>;
}

function useQueryState<T extends Record<string, unknown>>(
  schema: SearchParamSchema<T>,
  options?: UseQueryStateOptions<T>,
): {
  state: T;
  setState: (patch: Partial<T> | ((prev: T) => Partial<T>)) => void;
  replaceState: (patch: Partial<T> | ((prev: T) => Partial<T>)) => void;
  resetState: () => void;
};
```

### 대표 use-case

- 검색/필터/정렬/페이지네이션 상태를 URL에 반영
- 새로고침, 뒤로가기, 링크 공유 후 같은 화면 상태 복원

### 규칙

- `setState`는 기본적으로 `push` 또는 옵션의 default history 전략을 사용한다.
- `replaceState`는 히스토리를 늘리지 않아야 하는 입력 동기화에 사용한다.
- `resetState`는 schema가 관리하는 key만 제거한다.

### 경계

- Next Router, TanStack Router 같은 라우터 API를 직접 감싸지 않는다.
- 민감 정보나 대형 상태는 query string에 올리지 않는다.

## 기존 훅 인터페이스 요약

### `use-storage`

```ts
function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void];

function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void];
```

### `use-media-query`

```ts
function useMediaQuery(query: string): boolean;
```

### `use-click-outside`

```ts
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void): void;
```

### `use-pagination`

```ts
function usePagination(options?: {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
  totalPages?: number;
}): {
  page: number;
  limit: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  setLimit: (limit: number) => void;
  resetPage: () => void;
  params: OffsetPaginationParams;
  pagination: PaginationMeta;
};
```
