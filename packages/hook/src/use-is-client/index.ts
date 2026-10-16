import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * SSR/SSG 환경에서 클라이언트 여부를 안전하게 감지하는 훅.
 * 서버 렌더링 시 false, 하이드레이션 후 true를 반환한다.
 *
 * @example
 * const isClient = useIsClient();
 * {isClient && <DynamicChart data={data} />}
 */
export const useIsClient = (): boolean => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
