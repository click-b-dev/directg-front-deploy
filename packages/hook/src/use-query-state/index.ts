import { useCallback, useRef, useSyncExternalStore } from "react";
import {
  mergeSearchParams,
  parseSearchParams,
  type BuildSearchParamsOptions,
  type SearchParamSchema,
} from "@click-b/utils";

type QueryStatePatch<T extends Record<string, unknown>> = Partial<T>;
type QueryStateUpdater<T extends Record<string, unknown>> = (prev: T) => QueryStatePatch<T>;

type SerializedSearchParamValue = string | string[] | null | undefined;

export interface UseQueryStateOptions<T extends Record<string, unknown>> {
  /** query string serialize/merge 규칙을 세밀하게 조정한다. */
  buildOptions?: BuildSearchParamsOptions;
  /** `setState` 호출 시 기본 history 전략. */
  defaultHistory?: "push" | "replace";
  /** query string에 값이 없을 때 state에 덮어쓸 초기 fallback 값. */
  initialState?: QueryStatePatch<T>;
}

export interface UseQueryStateReturn<T extends Record<string, unknown>> {
  /** 현재 URL query string을 schema 기준으로 파싱한 상태 객체. */
  state: T;
  /** 기본 history 전략으로 partial patch를 반영한다. */
  setState: (patch: QueryStatePatch<T> | QueryStateUpdater<T>) => void;
  /** 항상 `replaceState` 전략으로 patch를 반영한다. */
  replaceState: (patch: QueryStatePatch<T> | QueryStateUpdater<T>) => void;
  /** schema가 관리하는 key만 query string에서 제거한다. */
  resetState: () => void;
}

const QUERY_STATE_EVENT = "click-b:query-state";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(QUERY_STATE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(QUERY_STATE_EVENT, onStoreChange);
  };
};

const dispatchQueryStateEvent = () => {
  window.dispatchEvent(new Event(QUERY_STATE_EVENT));
};

const getCurrentUrl = () => {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };
};

const createManagedKeysResetPatch = <T extends Record<string, unknown>>(
  schema: SearchParamSchema<T>,
): Record<string, null> => {
  const patch: Record<string, null> = {};

  for (const key of Object.keys(schema)) {
    patch[key] = null;
  }

  return patch;
};

/**
 * query string과 React 상태를 동기화하는 router-agnostic 훅.
 *
 * 인터페이스:
 * - 입력: `SearchParamSchema<T>`와 history/serialize 옵션
 * - 출력: `{ state, setState, replaceState, resetState }`
 * - 동작: `popstate`와 custom event를 함께 구독해 같은 탭 내부 history 변경도 즉시 반영한다
 *
 * use case:
 * - 검색, 필터, 정렬, 페이지네이션을 URL 공유 가능한 상태로 유지
 *
 * 주의:
 * - parsing/serialization 규칙은 `@click-b/utils/search-params`에 위임한다.
 * - 라우터 고유 API를 직접 감싸지 않는다.
 */
export const useQueryState = <T extends Record<string, unknown>>(
  schema: SearchParamSchema<T>,
  options: UseQueryStateOptions<T> = {},
): UseQueryStateReturn<T> => {
  const { buildOptions, defaultHistory = "push", initialState } = options;

  const lastSearchRef = useRef("");
  const lastSchemaRef = useRef(schema);
  const lastInitialStateRef = useRef(initialState);
  const cachedSnapshotRef = useRef<T | null>(null);

  const readState = useCallback((): T => {
    const search = typeof window === "undefined" ? "" : window.location.search;

    if (
      cachedSnapshotRef.current !== null &&
      search === lastSearchRef.current &&
      schema === lastSchemaRef.current &&
      initialState === lastInitialStateRef.current
    ) {
      return cachedSnapshotRef.current;
    }

    const parsed = parseSearchParams(search, schema);

    let result: T;
    if (!initialState) {
      result = parsed;
    } else {
      const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
      result = { ...parsed };
      for (const key of Object.keys(initialState) as (keyof T & string)[]) {
        if (!searchParams.has(key) && initialState[key] !== undefined) {
          result[key] = initialState[key] as T[typeof key];
        }
      }
    }

    lastSearchRef.current = search;
    lastSchemaRef.current = schema;
    lastInitialStateRef.current = initialState;
    cachedSnapshotRef.current = result;

    return result;
  }, [schema, initialState]);

  const state = useSyncExternalStore(subscribe, readState, readState);

  const writePatch = useCallback(
    (patchInput: QueryStatePatch<T> | QueryStateUpdater<T>, mode: "push" | "replace") => {
      if (typeof window === "undefined") {
        return;
      }

      const previousState = readState();
      const patch = typeof patchInput === "function" ? patchInput(previousState) : patchInput;
      const serializedPatch: Record<string, SerializedSearchParamValue> = {};

      for (const key of Object.keys(patch) as (keyof T & string)[]) {
        const nextValue = patch[key];
        if (nextValue === undefined) {
          continue;
        }

        serializedPatch[key] = schema[key].serialize(nextValue);
      }

      const { pathname, search, hash } = getCurrentUrl();
      const nextSearch = mergeSearchParams(search, serializedPatch, buildOptions);
      const nextUrl = `${pathname}${nextSearch ? `?${nextSearch}` : ""}${hash}`;

      if (mode === "replace") {
        window.history.replaceState(window.history.state, "", nextUrl);
      } else {
        window.history.pushState(window.history.state, "", nextUrl);
      }

      dispatchQueryStateEvent();
    },
    [buildOptions, readState, schema],
  );

  const setState = useCallback(
    (patch: QueryStatePatch<T> | QueryStateUpdater<T>) => {
      writePatch(patch, defaultHistory);
    },
    [defaultHistory, writePatch],
  );

  const replaceState = useCallback(
    (patch: QueryStatePatch<T> | QueryStateUpdater<T>) => {
      writePatch(patch, "replace");
    },
    [writePatch],
  );

  const resetState = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { pathname, search, hash } = getCurrentUrl();
    const nextSearch = mergeSearchParams(search, createManagedKeysResetPatch(schema), buildOptions);
    const nextUrl = `${pathname}${nextSearch ? `?${nextSearch}` : ""}${hash}`;

    window.history.replaceState(window.history.state, "", nextUrl);
    dispatchQueryStateEvent();
  }, [buildOptions, schema]);

  return {
    state,
    setState,
    replaceState,
    resetState,
  };
};
