import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
};

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

/**
 * 브라우저의 온라인/오프라인 상태를 구독하는 훅.
 *
 * 인터페이스:
 * - 입력: 없음
 * - 출력: 현재 `navigator.onLine` 스냅샷을 반영한 boolean
 * - SSR: 서버 스냅샷은 `true`를 사용해 기본 UI를 과도하게 오프라인으로 만들지 않는다
 *
 * 주의:
 * - 실제 인터넷 연결이나 API 서버 가용성을 보장하지 않는다
 */
export const useOnlineStatus = (): boolean => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
