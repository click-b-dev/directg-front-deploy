import { useCallback, useSyncExternalStore } from "react";

/**
 * CSS 미디어 쿼리 매칭 여부를 반환하는 훅.
 * 뷰포트 변경 시 실시간으로 상태가 업데이트된다.
 *
 * @param query CSS 미디어 쿼리 문자열
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
