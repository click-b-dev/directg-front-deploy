import { QueryClient } from "@tanstack/react-query";

// 관리자 목록/CRUD 공통 QueryClient. legacy는 페이지 새로고침(location.reload) 기반이라
// 캐시 신선도에 민감하지 않다 — 기본값 유지, mutation 후 명시적 invalidate로 목록 갱신.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
