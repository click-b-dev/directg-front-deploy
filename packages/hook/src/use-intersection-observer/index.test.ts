import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIntersectionObserver } from "./index";

type MockEntry = Partial<IntersectionObserverEntry>;

let mockObserverCallback: ((entries: MockEntry[]) => void) | null = null;
let mockObserverInstance: {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

class MockIntersectionObserver {
  constructor(callback: (entries: MockEntry[]) => void) {
    mockObserverCallback = callback;
    mockObserverInstance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    };
    return mockObserverInstance as unknown as IntersectionObserver;
  }
}

describe("useIntersectionObserver", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mockObserverCallback = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("callback ref를 반환한다", () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(typeof result.current.ref).toBe("function");
  });

  it("초기 상태에서 entry는 null, isIntersecting은 false이다", () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.entry).toBeNull();
    expect(result.current.isIntersecting).toBe(false);
  });

  it("ref에 element를 연결하면 observer가 observe를 호출한다", () => {
    const { result } = renderHook(() => useIntersectionObserver<HTMLDivElement>());
    const element = document.createElement("div");

    act(() => {
      result.current.ref(element);
    });

    expect(mockObserverInstance.observe).toHaveBeenCalledWith(element);
  });

  it("entry가 변경되면 isIntersecting이 업데이트된다", () => {
    const { result } = renderHook(() => useIntersectionObserver<HTMLDivElement>());
    const element = document.createElement("div");

    act(() => {
      result.current.ref(element);
    });

    act(() => {
      mockObserverCallback?.([{ isIntersecting: true } as MockEntry]);
    });

    expect(result.current.isIntersecting).toBe(true);
  });

  it("onChange 콜백이 entry 변경 시 호출된다", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useIntersectionObserver<HTMLDivElement>({ onChange }));
    const element = document.createElement("div");

    act(() => {
      result.current.ref(element);
    });

    const mockEntry = { isIntersecting: true } as MockEntry;
    act(() => {
      mockObserverCallback?.([mockEntry]);
    });

    expect(onChange).toHaveBeenCalledWith(mockEntry);
  });

  it("ref를 null로 설정하면 observer를 disconnect하고 entry를 초기화한다", () => {
    const { result } = renderHook(() => useIntersectionObserver<HTMLDivElement>());
    const element = document.createElement("div");

    act(() => {
      result.current.ref(element);
    });

    act(() => {
      mockObserverCallback?.([{ isIntersecting: true } as MockEntry]);
    });

    act(() => {
      result.current.ref(null);
    });

    expect(result.current.entry).toBeNull();
    expect(result.current.isIntersecting).toBe(false);
  });
});
