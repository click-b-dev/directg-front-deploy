import { createApiClient, createAuthHooks } from "@click-b/api-client";
import { AUTH_LOGIN_PATH } from "@shared/config/auth";
import { env } from "@shared/config/env";
import { clearSession, getAccessToken } from "@shared/lib/auth/session";

const normalizePrefix = (value: string) => value.replace(/\/$/, "");

// 모든 요청에 `Authorization: Bearer <JWT>`를 붙인다.
// swagger에 토큰 갱신 API가 없으므로 401(로그인 요청 제외)이면 세션을 파기하고 로그인 화면으로 보낸다.
const authHooks = createAuthHooks(
  {
    getAccessToken,
    refreshToken: () => Promise.reject(new Error("토큰 갱신 API 없음")),
    onRefreshFailure: () => {
      clearSession();
      if (typeof window !== "undefined") window.location.href = AUTH_LOGIN_PATH;
    },
  },
  { excludePaths: ["/admin/login"] },
);

export const apiClient = createApiClient({
  prefix: normalizePrefix(env.apiBaseUrl),
  hooks: {
    beforeRequest: [authHooks.beforeRequest],
    afterResponse: [authHooks.afterResponse],
  },
});
