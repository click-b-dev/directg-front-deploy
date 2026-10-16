/**
 * 브라우저 URL과 앱 상태 사이의 얇은 직렬화/역직렬화 레이어.
 *
 * 정의:
 * - 라우터를 대체하지 않고, "URL에 올려도 되는 얕은 상태"를 안정적으로 읽고 쓰는
 *   순수 함수 모듈이다.
 * - schema 기반 파싱과 partial patch merge를 제공해 목록/검색/필터 UI 상태를
 *   일관된 query string으로 유지한다.
 *
 * use case:
 * - 검색어, 정렬, 페이지네이션, 다중 필터를 공유 가능한 URL 상태로 유지할 때
 * - Next.js, React Router, TanStack Router 위에서 공통 직렬화 규칙을 재사용할 때
 * - SSR/CSR 환경에서 동일한 query string 해석 규칙을 유지하고 싶을 때
 *
 * out of scope:
 * - 민감 정보, 대용량 JSON 상태, 깊은 중첩 객체 직렬화
 * - 라우팅 훅, 히스토리 이동, navigation side effect
 */

type SearchParamRawValue = string | string[] | null;
type SearchParamPrimitive = string | number | boolean;
type SearchParamInputValue =
  | SearchParamPrimitive
  | null
  | undefined
  | readonly (SearchParamPrimitive | null | undefined)[];

export type SearchParamParser<T> = {
  /** raw query value를 원하는 도메인 타입으로 변환한다. */
  parse: (raw: SearchParamRawValue) => T;
  /** 상태값을 query string에 기록 가능한 값으로 직렬화한다. */
  serialize: (value: T) => string | string[] | null | undefined;
  /** parse 실패 또는 값 부재 시 사용할 fallback 값이다. */
  defaultValue?: T;
};

export type SearchParamSchema<T extends Record<string, unknown>> = {
  [K in keyof T]: SearchParamParser<T[K]>;
};

export interface BuildSearchParamsOptions {
  /** null을 직렬화에서 제외한다. `mergeSearchParams`에서는 보통 delete 의미로 사용한다. */
  skipNull?: boolean;
  /** 빈 문자열을 직렬화에서 제외한다. */
  skipEmptyString?: boolean;
  /** 배열을 repeated key 또는 comma string으로 직렬화한다. */
  arrayFormat?: "repeat" | "comma";
}

const DEFAULT_BUILD_OPTIONS: Required<BuildSearchParamsOptions> = {
  skipNull: true,
  skipEmptyString: true,
  arrayFormat: "repeat",
};

const normalizeOptions = (
  options?: BuildSearchParamsOptions,
): Required<BuildSearchParamsOptions> => {
  return {
    ...DEFAULT_BUILD_OPTIONS,
    ...options,
  };
};

const normalizeSource = (source: string | URLSearchParams): URLSearchParams => {
  if (source instanceof URLSearchParams) {
    return new URLSearchParams(source);
  }

  const normalized = source.startsWith("?") ? source.slice(1) : source;
  return new URLSearchParams(normalized);
};

const isSearchParamArray = (
  value: SearchParamInputValue,
): value is readonly (SearchParamPrimitive | null | undefined)[] => {
  return Array.isArray(value);
};

const coerceSerializedValue = (
  value: SearchParamPrimitive | null | undefined,
  options: Required<BuildSearchParamsOptions>,
): string | null => {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return options.skipNull ? null : "";
  }

  const serialized = String(value);
  if (serialized === "" && options.skipEmptyString) {
    return null;
  }

  return serialized;
};

const writeSearchParamValue = (
  searchParams: URLSearchParams,
  key: string,
  value: SearchParamInputValue,
  options: Required<BuildSearchParamsOptions>,
): void => {
  if (isSearchParamArray(value)) {
    const serializedValues = value
      .map((item) => coerceSerializedValue(item, options))
      .filter((item): item is string => item !== null);

    if (serializedValues.length === 0) {
      return;
    }

    if (options.arrayFormat === "comma") {
      searchParams.set(key, serializedValues.join(","));
      return;
    }

    for (const item of serializedValues) {
      searchParams.append(key, item);
    }

    return;
  }

  const serialized = coerceSerializedValue(value, options);
  if (serialized === null) {
    return;
  }

  searchParams.set(key, serialized);
};

const getRawValue = (searchParams: URLSearchParams, key: string): SearchParamRawValue => {
  const values = searchParams.getAll(key);

  if (values.length === 0) {
    return null;
  }

  return values.length === 1 ? values[0] : values;
};

const parseWithFallback = <T>(parser: SearchParamParser<T>, raw: SearchParamRawValue): T => {
  try {
    return parser.parse(raw);
  } catch {
    if (parser.defaultValue !== undefined) {
      return parser.defaultValue;
    }

    return parser.parse(null);
  }
};

export const parseSearchParams = <T extends Record<string, unknown>>(
  source: string | URLSearchParams,
  schema: SearchParamSchema<T>,
): T => {
  const searchParams = normalizeSource(source);
  const result = {} as T;

  for (const key of Object.keys(schema) as (keyof T & string)[]) {
    result[key] = parseWithFallback(schema[key], getRawValue(searchParams, key));
  }

  return result;
};

/**
 * 객체를 deterministic query string으로 직렬화한다.
 *
 * 인터페이스:
 * - 입력: string/number/boolean/배열/null/undefined를 값으로 가지는 평평한 객체
 * - 출력: `?` 없는 query string
 *
 * use case:
 * - 검색/필터/정렬 상태를 URL에 기록
 * - 라우터 구현체와 무관한 순수 serialization 단계 구성
 */
export const buildSearchParams = (
  input: Record<string, SearchParamInputValue>,
  options?: BuildSearchParamsOptions,
): string => {
  const normalizedOptions = normalizeOptions(options);
  const searchParams = new URLSearchParams();

  for (const key of Object.keys(input).sort()) {
    writeSearchParamValue(searchParams, key, input[key], normalizedOptions);
  }

  return searchParams.toString();
};

/**
 * 기존 query string에 partial patch를 적용한다.
 *
 * 인터페이스:
 * - 입력: 기존 query string 또는 `URLSearchParams`, 그리고 patch 객체
 * - 출력: patch가 반영된 새 query string
 *
 * 규칙:
 * - patch에 없는 key는 유지한다.
 * - patch의 `undefined`는 "변경 없음"으로 취급한다.
 * - patch의 `null`은 해당 key 삭제로 취급한다.
 * - 배열 patch는 기존 값을 전부 지우고 새 값으로 다시 쓴다.
 */
export const mergeSearchParams = (
  base: string | URLSearchParams,
  patch: Record<string, SearchParamInputValue>,
  options?: BuildSearchParamsOptions,
): string => {
  const normalizedOptions = normalizeOptions(options);
  const searchParams = normalizeSource(base);

  for (const key of Object.keys(patch).sort()) {
    const nextValue = patch[key];
    if (nextValue === undefined) {
      continue;
    }

    searchParams.delete(key);
    writeSearchParamValue(searchParams, key, nextValue, normalizedOptions);
  }

  return searchParams.toString();
};
