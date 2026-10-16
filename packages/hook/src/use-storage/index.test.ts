import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage, useSessionStorage } from "./index";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("초기값을 반환한다", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("setValue로 값을 업데이트한다", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
  });

  it("updater 함수를 setValue에 전달할 수 있다", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("removeValue로 저장된 값을 제거하고 초기값으로 돌아간다", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("stored");
    });
    expect(result.current[0]).toBe("stored");

    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe("initial");
  });

  it("객체 타입을 저장하고 읽을 수 있다", () => {
    const { result } = renderHook(() => useLocalStorage("user", { name: "test", age: 25 }));

    act(() => {
      result.current[1]({ name: "updated", age: 30 });
    });

    expect(result.current[0]).toEqual({ name: "updated", age: 30 });
  });

  it("저장 내용이 변경되지 않으면 객체 스냅샷 참조가 유지된다", () => {
    const { result, rerender } = renderHook(() => useLocalStorage("stable", { a: 1 }));

    const firstRef = result.current[0];
    rerender();
    expect(result.current[0]).toBe(firstRef);
  });
});

describe("useSessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("초기값을 반환한다", () => {
    const { result } = renderHook(() => useSessionStorage("test-key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("setValue로 값을 업데이트한다", () => {
    const { result } = renderHook(() => useSessionStorage("test-key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
  });

  it("removeValue로 저장된 값을 제거한다", () => {
    const { result } = renderHook(() => useSessionStorage("test-key", "initial"));

    act(() => {
      result.current[1]("stored");
    });

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("initial");
  });
});
