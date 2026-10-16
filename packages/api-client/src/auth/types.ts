import type { BeforeRequestHook, AfterResponseHook } from "ky";

export interface AuthTokenProvider {
  getAccessToken: () => string | null | Promise<string | null>;
  refreshToken: () => Promise<string>;
  onRefreshFailure: () => void;
}

export interface AuthHooksOptions {
  /** refresh를 시도하지 않을 경로 목록 (기본: /auth/token/refresh, /auth/login, /auth/social-login) */
  excludePaths?: string[];
}

export interface AuthHooks {
  beforeRequest: BeforeRequestHook;
  afterResponse: AfterResponseHook;
}
