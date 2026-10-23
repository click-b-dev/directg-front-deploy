import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { EnvelopeError, toApiErrorMessage } from "@shared/api/envelope";

// 조회/변경 요청 실패 공통 알림(legacy msg()의 alert 대응). 서버 code → 프론트 문구로 변환해 표시한다.
// - 401은 api-client auth hook이 세션 파기 후 /login으로 보내므로 알림 생략.
// - 한 화면에서 요청이 동시에 여러 개 실패해도 알림은 한 번만(같은 문구 1초 내 중복 억제).
let lastAlert = { message: "", at: 0 };

const notifyApiError = (error: unknown) => {
  if (error instanceof EnvelopeError && error.status === 401) return;
  const message = toApiErrorMessage(error);
  const now = Date.now();
  if (message === lastAlert.message && now - lastAlert.at < 1000) return;
  lastAlert = { message, at: now };
  window.alert(message);
};

// 관리자 목록/CRUD 공통 QueryClient. legacy는 페이지 새로고침(location.reload) 기반이라
// 캐시 신선도에 민감하지 않다 — 기본값 유지, mutation 후 명시적 invalidate로 목록 갱신.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: notifyApiError }),
  // 화면이 결과({id}/{message})로 직접 알림하는 mutation은 throw하지 않으므로 중복되지 않는다.
  mutationCache: new MutationCache({ onError: notifyApiError }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
