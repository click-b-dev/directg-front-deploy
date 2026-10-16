import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnlineStatus } from "./index";

describe("useOnlineStatus", () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator")!;

  const setOnLine = (value: boolean) => {
    Object.defineProperty(navigator, "onLine", {
      value,
      writable: true,
      configurable: true,
    });
  };

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", originalNavigator);
  });

  it("navigator.onLine이 true이면 true를 반환한다", () => {
    setOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("navigator.onLine이 false이면 false를 반환한다", () => {
    setOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it("offline 이벤트에 반응하여 값이 갱신된다", () => {
    setOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      setOnLine(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current).toBe(false);
  });

  it("online 이벤트에 반응하여 값이 갱신된다", () => {
    setOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      setOnLine(true);
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toBe(true);
  });

  it("언마운트 시 이벤트 리스너를 정리한다", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    removeSpy.mockRestore();
  });
});
