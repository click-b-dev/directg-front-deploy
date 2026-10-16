import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SearchParamSchema } from "@click-b/utils";
import { useQueryState } from "./index";

type TestState = { keyword: string; page: number };

const testSchema: SearchParamSchema<TestState> = {
  keyword: {
    parse: (raw) => (typeof raw === "string" ? raw : ""),
    serialize: (value) => (value === "" ? null : value),
    defaultValue: "",
  },
  page: {
    parse: (raw) => {
      if (raw === null || Array.isArray(raw)) return 0;
      const n = Number(raw);
      return Number.isNaN(n) ? 0 : n;
    },
    serialize: (value) => String(value),
    defaultValue: 0,
  },
};

const setUrl = (search: string) => {
  window.history.replaceState(null, "", `/${search ? `?${search}` : ""}`);
};

describe("useQueryState", () => {
  beforeEach(() => {
    setUrl("");
  });

  afterEach(() => {
    setUrl("");
  });

  it("빈 URL에서 schema의 기본값을 반환한다", () => {
    const { result } = renderHook(() => useQueryState(testSchema));
    expect(result.current.state).toEqual({ keyword: "", page: 0 });
  });

  it("URL의 query string을 파싱하여 상태를 반환한다", () => {
    setUrl("keyword=hello&page=3");
    const { result } = renderHook(() => useQueryState(testSchema));
    expect(result.current.state).toEqual({ keyword: "hello", page: 3 });
  });

  it("setState로 URL을 업데이트한다", () => {
    const { result } = renderHook(() => useQueryState(testSchema));

    act(() => {
      result.current.setState({ keyword: "test" });
    });

    expect(result.current.state.keyword).toBe("test");
    expect(window.location.search).toContain("keyword=test");
  });

  it("setState는 기본적으로 pushState를 사용한다", () => {
    const pushSpy = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useQueryState(testSchema));

    act(() => {
      result.current.setState({ page: 5 });
    });

    expect(pushSpy).toHaveBeenCalled();
    pushSpy.mockRestore();
  });

  it("replaceState는 history.replaceState를 사용한다", () => {
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useQueryState(testSchema));

    act(() => {
      result.current.replaceState({ page: 5 });
    });

    expect(replaceSpy).toHaveBeenCalled();
    replaceSpy.mockRestore();
  });

  it("setState에 updater 함수를 전달할 수 있다", () => {
    setUrl("page=3");
    const { result } = renderHook(() => useQueryState(testSchema));

    act(() => {
      result.current.setState((prev) => ({ page: prev.page + 1 }));
    });

    expect(result.current.state.page).toBe(4);
  });

  it("resetState는 schema가 관리하는 key만 URL에서 제거한다", () => {
    setUrl("keyword=hello&page=3&other=keep");
    const { result } = renderHook(() => useQueryState(testSchema));

    act(() => {
      result.current.resetState();
    });

    expect(window.location.search).toContain("other=keep");
    expect(window.location.search).not.toContain("keyword=");
    expect(window.location.search).not.toContain("page=");
  });

  it("initialState는 URL에 값이 없을 때만 적용된다", () => {
    setUrl("page=5");
    const { result } = renderHook(() =>
      useQueryState(testSchema, { initialState: { keyword: "fallback", page: 1 } }),
    );

    // URL에 있는 page=5는 유지, URL에 없는 keyword는 initialState 적용
    expect(result.current.state.page).toBe(5);
    expect(result.current.state.keyword).toBe("fallback");
  });

  it("initialState 없이도 정상 동작한다", () => {
    setUrl("keyword=test");
    const { result } = renderHook(() => useQueryState(testSchema));
    expect(result.current.state).toEqual({ keyword: "test", page: 0 });
  });

  it("defaultHistory 옵션으로 기본 history 전략을 변경할 수 있다", () => {
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useQueryState(testSchema, { defaultHistory: "replace" }));

    act(() => {
      result.current.setState({ keyword: "test" });
    });

    expect(replaceSpy).toHaveBeenCalled();
    replaceSpy.mockRestore();
  });

  it("동일한 URL이면 스냅샷 참조를 재사용한다 (참조 안정성)", () => {
    setUrl("keyword=stable&page=1");
    const { result } = renderHook(() => useQueryState(testSchema));

    const firstSnapshot = result.current.state;

    // popstate 이벤트를 발생시키되 URL은 변경하지 않음
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.state).toBe(firstSnapshot);
  });
});
