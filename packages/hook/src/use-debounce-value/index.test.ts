import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounceValue } from "./index";

describe("useDebounceValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("초기값을 즉시 반환한다", () => {
    const { result } = renderHook(() => useDebounceValue("initial", 300));
    expect(result.current[0]).toBe("initial");
  });

  it("setter 호출 후 delay가 지나야 debounced 값이 갱신된다", () => {
    const { result } = renderHook(() => useDebounceValue("", 300));

    act(() => {
      result.current[1]("updated");
    });

    // delay 전에는 아직 이전 값
    expect(result.current[0]).toBe("");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // delay 후에 갱신
    expect(result.current[0]).toBe("updated");
  });

  it("delay 내에 여러 번 호출하면 마지막 값만 반영된다", () => {
    const { result } = renderHook(() => useDebounceValue("", 300));

    act(() => {
      result.current[1]("first");
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current[1]("second");
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current[1]("third");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current[0]).toBe("third");
  });

  it("기본 delay는 300ms이다", () => {
    const { result } = renderHook(() => useDebounceValue(""));

    act(() => {
      result.current[1]("test");
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current[0]).toBe("");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe("test");
  });

  it("updater 함수를 setter에 전달할 수 있다", () => {
    const { result } = renderHook(() => useDebounceValue(0, 100));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe(1);
  });
});
