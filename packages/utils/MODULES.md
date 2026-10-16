# @click-b/utils Modules

`@click-b/utils`는 모노레포 전역에서 재사용하는 순수 함수 패키지다. 이 문서는 개발자와 AI 도구가 각 모듈의 책임, 경계, 대표 use-case를 빠르게 식별할 수 있도록 모듈 계약을 정리한다.

## 원칙

- 이 패키지는 React, 라우터, 상태관리, 네트워크 클라이언트에 의존하지 않는다.
- 런타임 side effect를 직접 일으키지 않는 순수 함수 또는 얇은 브라우저 API 래퍼만 포함한다.
- 비즈니스 규칙은 앱/엔티티 레이어에 두고, 여기에는 범용 패턴만 올린다.
- 루트 import(`@click-b/utils`)와 subpath import를 모두 지원하지만, 모듈 의도가 중요할 때는 subpath import를 우선한다.

## 인터페이스 규칙

- 각 모듈 문서에는 "정의 / 공개 API / 인터페이스 / use-case / 경계"를 함께 유지한다.
- 공개 API는 실제 export 이름 기준으로 기록한다.
- 타입 계약이 핵심인 모듈은 코드 블록으로 시그니처를 남긴다.
- 값 변환 규칙이 중요한 경우 입력, 출력, 삭제 규칙까지 문서화한다.

## 모듈 맵

| 모듈            | import 경로                    | 책임                                  | 대표 use-case                                | 제외 범위                             |
| --------------- | ------------------------------ | ------------------------------------- | -------------------------------------------- | ------------------------------------- |
| `assert`        | `@click-b/utils/assert`        | 런타임 invariant, exhaustive check    | nullable 전제 검증, switch 분기 누락 방지    | 사용자 입력 검증, 폼 에러             |
| `search-params` | `@click-b/utils/search-params` | URL query string 직렬화/역직렬화      | 목록 필터, 검색어, 페이지네이션, 정렬        | 라우팅, 히스토리 이동, 민감 정보 저장 |
| `intl`          | `@click-b/utils/intl`          | locale-aware 숫자/통화/날짜 포맷      | SSR/CSR 공통 포맷, locale/timeZone 명시 포맷 | 번역 메시지 관리, locale context      |
| `url`           | `@click-b/utils`               | URL 검증, 기본 query string 처리      | 외부/내부 URL 판정, 간단 query 생성          | schema 기반 상태 관리                 |
| `date`          | `@click-b/utils`               | 고정 포맷 날짜 문자열, D-Day          | 단순 날짜 표시, 상대 시각, 카운트다운 표기   | locale-aware 다국어 포맷              |
| `number`        | `@click-b/utils`               | 고정 규칙 금액/퍼센트 포맷            | KRW/USD 금액 문자열, 퍼센트 표시             | locale/timeZone 고려 포맷             |
| `string`        | `@click-b/utils`               | 케이스 변환, truncate, mask, sanitize | slug 변환, 개인정보 마스킹                   | 국제화 번역                           |
| `object`        | `@click-b/utils`               | pick/omit/filter/typed object helper  | DTO 가공, 부분 추출                          | 깊은 merge 정책                       |
| `type-guard`    | `@click-b/utils`               | 기본 narrowing helper                 | null 제거, primitive 판정                    | 복잡한 schema validation              |
| `function`      | `@click-b/utils`               | debounce/throttle                     | 입력 지연, 스크롤/resize 제어                | 비동기 취소/timeout                   |
| `cookie`        | `@click-b/utils`               | document.cookie 래퍼                  | 토큰/설정 쿠키 읽기/쓰기                     | HttpOnly 서버 쿠키 관리               |
| `storage`       | `@click-b/utils`               | typed local/session storage           | 브라우저 저장소 접근, TTL 저장               | 서버 저장소, 암호화                   |
| `http`          | `@click-b/utils`               | status/method/header 상수와 판별      | status category 분기                         | 실제 API 호출                         |

## `assert`

### 정의

개발자 전제가 깨졌을 때 즉시 실패시키는 모듈이다. recover 가능한 예외보다 "이 상태는 여기서 허용되지 않는다"를 코드에 남기는 데 초점을 둔다.

### 공개 API

- `assert(condition, message)`
- `assertNever(value, message?)`

### 인터페이스

```ts
function assert(condition: unknown, message: string | Error): asserts condition;
function assertNever(value: never, message?: string): never;
```

### 대표 use-case

- `query.data`가 존재해야 이후 로직을 계속할 수 있을 때
- 설정값이나 environment 값이 부트스트랩 시점에 반드시 있어야 할 때
- discriminated union `switch`에서 빠진 분기를 빌드 시점과 런타임 모두에서 드러내고 싶을 때

### 경계

- 사용자 입력 오류를 화면 메시지로 변환하는 역할은 하지 않는다.
- API 응답 전체를 assert로 검증하지 않는다. 구조 검증은 schema/Zod 레이어가 맡는다.

## `search-params`

### 정의

브라우저 URL과 앱 상태 사이의 얇은 serialization layer다. 라우터 훅 위에서 재사용할 수 있는 순수 함수만 제공한다.

### 공개 API

- `parseSearchParams(source, schema)`
- `buildSearchParams(input, options?)`
- `mergeSearchParams(base, patch, options?)`
- `SearchParamParser<T>`
- `SearchParamSchema<T>`
- `BuildSearchParamsOptions`

### 인터페이스

```ts
type SearchParamRawValue = string | string[] | null;

type SearchParamParser<T> = {
  parse: (raw: SearchParamRawValue) => T;
  serialize: (value: T) => string | string[] | null | undefined;
  defaultValue?: T;
};

type SearchParamSchema<T extends Record<string, unknown>> = {
  [K in keyof T]: SearchParamParser<T[K]>;
};

interface BuildSearchParamsOptions {
  skipNull?: boolean;
  skipEmptyString?: boolean;
  arrayFormat?: "repeat" | "comma";
}

function parseSearchParams<T extends Record<string, unknown>>(
  source: string | URLSearchParams,
  schema: SearchParamSchema<T>,
): T;

function buildSearchParams(
  input: Record<
    string,
    | string
    | number
    | boolean
    | null
    | undefined
    | readonly (string | number | boolean | null | undefined)[]
  >,
  options?: BuildSearchParamsOptions,
): string;

function mergeSearchParams(
  base: string | URLSearchParams,
  patch: Record<string, string | string[] | null | undefined>,
  options?: BuildSearchParamsOptions,
): string;
```

### 입출력 규칙

- `parseSearchParams`는 schema에 정의된 key만 읽는다.
- `buildSearchParams`는 `?` 없는 query string을 반환한다.
- `mergeSearchParams`에서 `undefined`는 유지, `null`은 삭제 의미다.
- 배열 기본 직렬화는 repeated key다.

### 대표 use-case

- 검색 페이지에서 `q`, `page`, `sort`, `tags`를 query string으로 유지
- URL 공유 시 같은 필터 상태를 재현
- 라우터 구현체가 달라도 동일한 직렬화 규칙 유지

### 규칙

- `schema`에 정의되지 않은 key는 무시한다.
- `undefined`는 기본적으로 "변경 없음" 또는 "출력 제외"다.
- `null`은 merge 시 delete 의미다.
- 배열 기본 직렬화는 repeated key(`tag=a&tag=b`)다.

### 경계

- 깊은 객체를 query string JSON으로 넣는 패턴은 지원하지 않는다.
- access token, session id 같은 민감 정보는 URL에 올리지 않는다.

## `intl`

### 정의

내장 `Intl.*` API를 일관되게 사용하는 facade다. 앱마다 제각각 `new Intl.*()`를 흩뿌리지 않도록 공통 entry point를 만든다.

### 공개 API

- `formatNumber(value, locale?, options?)`
- `formatCurrency(value, locale, currency, options?)`
- `formatDateTime(value, locale?, options?)`
- `formatRelativeTime(value, unit, locale?, options?)`

### 인터페이스

```ts
type IntlDateTimeInput = Date | string | number;

type IntlDateTimeOptions = Intl.DateTimeFormatOptions & {
  timeZone?: string;
};

function formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string;

function formatCurrency(
  value: number,
  locale: string,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string;

function formatDateTime(
  value: IntlDateTimeInput,
  locale?: string,
  options?: IntlDateTimeOptions,
): string;

function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale?: string,
  options?: Intl.RelativeTimeFormatOptions,
): string;
```

### 대표 use-case

- 관리자 화면에서 통화/백분율/통계를 locale별로 다르게 보여줄 때
- SSR에서 `locale`, `timeZone`을 명시해 hydration mismatch 가능성을 줄일 때
- 기존 `date`, `number` 모듈로는 부족한 다국어/타임존 포맷을 추가할 때

### 규칙

- 번역 메시지와 문장 조합은 앱 레벨 i18n 라이브러리가 맡고, 이 모듈은 값 포맷만 담당한다.
- 테스트와 SSR에서는 `locale`, `timeZone`을 가능하면 명시한다.
- `date` 모듈이 고정 문자열 포맷이라면, `intl`은 locale-aware 표현이 필요할 때 선택한다.

### 경계

- 캘린더 계산, timezone conversion 자체는 하지 않는다.
- `next-intl`, `react-intl`의 context/provider 역할을 대체하지 않는다.

## 기존 모듈 인터페이스 요약

### `url`

```ts
class UrlValidator {
  constructor(options: { baseUrl: string; allowedOrigins?: string[] });
  checkIsValidServiceUrl(url: string): boolean;
  checkIsSameOrigin(url: string): boolean;
  checkIsExternal(url: string): boolean;
  checkIsSafeUrl(url: string): boolean;
  checkIsAllowedOrigin(url: string): boolean;
  parse(url: string): ParsedUrlComponents | null;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string;

function parseQueryString(queryString: string): Record<string, string>;
```

### `date`

```ts
function formatDate(date: Date, format?: DateFormat): string;
function formatRelativeTime(date: Date, locale?: "ko" | "en", now?: Date): string;
function formatDDay(targetDate: Date, today?: Date): string;
function getDDayNumber(targetDate: Date, today?: Date): number;
```

### `number`

```ts
function formatMoney(
  value: number,
  options?: { currency?: "KRW" | "USD"; decimals?: number; showSymbol?: boolean },
): string;

function formatPercent(
  value: number,
  options?: { decimals?: number; rounding?: "round" | "ceil" | "floor" },
): string;
```

### `type-guard`

```ts
function isNonNullable<T>(value: T): value is NonNullable<T>;
function isString(value: unknown): value is string;
function isNumber(value: unknown): value is number;
```
