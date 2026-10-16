import type { AfterResponseHook, BeforeRequestHook } from "ky";
import type { AuthTokenProvider, AuthHooks, AuthHooksOptions } from "./types";

const DEFAULT_EXCLUDE_PATHS = ["/auth/token/refresh", "/auth/login", "/auth/social-login"];

export const createAuthHooks = (
  provider: AuthTokenProvider,
  options?: AuthHooksOptions,
): AuthHooks => {
  const excludePaths = options?.excludePaths ?? DEFAULT_EXCLUDE_PATHS;
  const isRefreshExcluded = (url: string) => excludePaths.some((path) => url.includes(path));

  let refreshPromise: Promise<string> | null = null;

  const beforeRequest: BeforeRequestHook = async ({ request }) => {
    const token = await provider.getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
  };

  const afterResponse: AfterResponseHook = async ({ request, response, retryCount }) => {
    if (response.status !== 401 || isRefreshExcluded(request.url) || retryCount > 0) {
      return;
    }

    if (!refreshPromise) {
      refreshPromise = provider.refreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const newToken = await refreshPromise;
      const headers = new Headers(request.headers);
      headers.set("Authorization", `Bearer ${newToken}`);

      // ky 내부 API(ky.retry) 대신 fetch로 직접 재요청
      return fetch(new Request(request, { headers }));
    } catch {
      // 의도된 동작: refresh 실패 시 onRefreshFailure(로그아웃 등)를 호출하고
      // 원래 401 응답을 그대로 통과시켜 호출자가 일관된 에러를 받도록 한다.
      provider.onRefreshFailure();
    }
  };

  return { beforeRequest, afterResponse };
};
