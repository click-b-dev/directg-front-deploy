import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useResizeObserver } from "./index";

type MockEntry = Partial<ResizeObserverEntry>;

let mockObserverCallback: ((entries: MockEntry[]) => void) | null = null;
let mockObserverInstance: {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

class MockResizeObserver {
  constructor(callback: (entries: MockEntry[]) => void) {
    mockObserverCallback = callback;
    mockObserverInstance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    };
    return mockObserverInstance as unknown as ResizeObserver;
  }
}

describe("useResizeObserver", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    mockObserverCallback = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("초기 상태에서 빈 size 객체를 반환한다 (ref.current가 null)", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useResizeObserver({ ref });
    });

    expect(result.current).toEqual({});
  });

  it("ref에 element가 연결되면 초기 크기를 측정한다", () => {
    const element = document.createElement("div");
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({ width: 200, height: 100, top: 0, left: 0, right: 200, bottom: 100 }),
    });

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(element);
      return useResizeObserver({ ref });
    });

    expect(result.current.width).toBe(200);
    expect(result.current.height).toBe(100);
  });

  it("ResizeObserver 콜백으로 크기가 업데이트된다", () => {
    const element = document.createElement("div");
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({ width: 100, height: 50, top: 0, left: 0, right: 100, bottom: 50 }),
    });

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(element);
      return useResizeObserver({ ref });
    });

    act(() => {
      mockObserverCallback?.([
        {
          contentBoxSize: [
            { inlineSize: 300, blockSize: 150 },
          ] as unknown as readonly ResizeObserverSize[],
          contentRect: { width: 300, height: 150 } as DOMRectReadOnly,
        } as MockEntry,
      ]);
    });

    expect(result.current.width).toBe(300);
    expect(result.current.height).toBe(150);
  });

  it("같은 크기로 업데이트하면 참조가 유지된다 (불필요한 리렌더 방지)", () => {
    const element = document.createElement("div");
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({ width: 100, height: 50, top: 0, left: 0, right: 100, bottom: 50 }),
    });

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(element);
      return useResizeObserver({ ref });
    });

    const firstResult = result.current;

    act(() => {
      mockObserverCallback?.([
        {
          contentBoxSize: [
            { inlineSize: 100, blockSize: 50 },
          ] as unknown as readonly ResizeObserverSize[],
          contentRect: { width: 100, height: 50 } as DOMRectReadOnly,
        } as MockEntry,
      ]);
    });

    expect(result.current).toBe(firstResult);
  });
});
