import { describe, expect, it, vi } from "vitest";
import type { NormalizedOptions, KyRequest, KyResponse } from "ky";
import type { AuthTokenProvider } from "./types";
import { createAuthHooks } from "./hooks";

const makeRequest = (url = "https://api.example.com/users") =>
  new Request(url, { method: "GET" }) as KyRequest;

const makeResponse = (status: number) => new Response(null, { status }) as KyResponse;

const makeOptions = () => ({}) as NormalizedOptions;

const createMockProvider = (overrides?: Partial<AuthTokenProvider>): AuthTokenProvider => ({
  getAccessToken: vi.fn().mockResolvedValue("test-access-token"),
  refreshToken: vi.fn().mockResolvedValue("new-access-token"),
  onRefreshFailure: vi.fn(),
  ...overrides,
});

describe("createAuthHooks", () => {
  describe("beforeRequest", () => {
    it("토큰이 있으면 Authorization 헤더를 주입한다", async () => {
      const provider = createMockProvider();
      const { beforeRequest } = createAuthHooks(provider);
      const request = makeRequest();

      await beforeRequest({ request, options: makeOptions(), retryCount: 0 });

      expect(request.headers.get("Authorization")).toBe("Bearer test-access-token");
    });

    it("토큰이 null이면 헤더를 주입하지 않는다", async () => {
      const provider = createMockProvider({
        getAccessToken: vi.fn().mockResolvedValue(null),
      });
      const { beforeRequest } = createAuthHooks(provider);
      const request = makeRequest();

      await beforeRequest({ request, options: makeOptions(), retryCount: 0 });

      expect(request.headers.has("Authorization")).toBe(false);
    });

    it("비동기 getAccessToken을 지원한다", async () => {
      const provider = createMockProvider({
        getAccessToken: vi.fn().mockResolvedValue("async-token"),
      });
      const { beforeRequest } = createAuthHooks(provider);
      const request = makeRequest();

      await beforeRequest({ request, options: makeOptions(), retryCount: 0 });

      expect(request.headers.get("Authorization")).toBe("Bearer async-token");
    });
  });

  describe("afterResponse", () => {
    it("401이 아닌 응답은 무시한다", async () => {
      const provider = createMockProvider();
      const { afterResponse } = createAuthHooks(provider);

      const result = await afterResponse({
        request: makeRequest(),
        options: makeOptions(),
        response: makeResponse(200),
        retryCount: 0,
      });

      expect(result).toBeUndefined();
      expect(provider.refreshToken).not.toHaveBeenCalled();
    });

    it.each(["/auth/token/refresh", "/auth/login", "/auth/social-login"])(
      "제외 경로(%s)에서는 refresh를 시도하지 않는다",
      async (path) => {
        const provider = createMockProvider();
        const { afterResponse } = createAuthHooks(provider);

        const result = await afterResponse({
          request: makeRequest(`https://api.example.com${path}`),
          options: makeOptions(),
          response: makeResponse(401),
          retryCount: 0,
        });

        expect(result).toBeUndefined();
        expect(provider.refreshToken).not.toHaveBeenCalled();
      },
    );

    it("retryCount > 0이면 refresh를 시도하지 않는다 (무한 루프 방지)", async () => {
      const provider = createMockProvider();
      const { afterResponse } = createAuthHooks(provider);

      const result = await afterResponse({
        request: makeRequest(),
        options: makeOptions(),
        response: makeResponse(401),
        retryCount: 1,
      });

      expect(result).toBeUndefined();
      expect(provider.refreshToken).not.toHaveBeenCalled();
    });

    it("401 응답 시 refreshToken을 호출하고 새 토큰으로 재요청한다", async () => {
      const provider = createMockProvider();
      const { afterResponse } = createAuthHooks(provider);

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

      const result = await afterResponse({
        request: makeRequest(),
        options: makeOptions(),
        response: makeResponse(401),
        retryCount: 0,
      });

      expect(provider.refreshToken).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const retryRequest = fetchSpy.mock.calls[0][0] as Request;
      expect(retryRequest.headers.get("Authorization")).toBe("Bearer new-access-token");
      expect(result).toBeInstanceOf(Response);

      fetchSpy.mockRestore();
    });

    it("동시 401 요청에서 refreshToken은 1회만 호출된다 (shared promise)", async () => {
      let resolveRefresh: (value: string) => void;
      const provider = createMockProvider({
        refreshToken: vi.fn(() => new Promise<string>((resolve) => (resolveRefresh = resolve))),
      });
      const { afterResponse } = createAuthHooks(provider);

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

      const state = {
        request: makeRequest(),
        options: makeOptions(),
        response: makeResponse(401),
        retryCount: 0 as const,
      };

      // 동시에 3개 요청이 401을 받음
      const p1 = afterResponse({ ...state, request: makeRequest("https://api.example.com/a") });
      const p2 = afterResponse({ ...state, request: makeRequest("https://api.example.com/b") });
      const p3 = afterResponse({ ...state, request: makeRequest("https://api.example.com/c") });

      resolveRefresh!("shared-new-token");
      await Promise.all([p1, p2, p3]);

      expect(provider.refreshToken).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      fetchSpy.mockRestore();
    });

    it("refresh 실패 시 onRefreshFailure를 호출한다", async () => {
      const provider = createMockProvider({
        refreshToken: vi.fn().mockRejectedValue(new Error("REFRESH_FAILED")),
      });
      const { afterResponse } = createAuthHooks(provider);

      await afterResponse({
        request: makeRequest(),
        options: makeOptions(),
        response: makeResponse(401),
        retryCount: 0,
      });

      expect(provider.onRefreshFailure).toHaveBeenCalledTimes(1);
    });

    it("커스텀 excludePaths 옵션이 적용된다", async () => {
      const provider = createMockProvider();
      const { afterResponse } = createAuthHooks(provider, {
        excludePaths: ["/custom/no-refresh"],
      });

      // 커스텀 경로에서는 refresh 미시도
      const result = await afterResponse({
        request: makeRequest("https://api.example.com/custom/no-refresh"),
        options: makeOptions(),
        response: makeResponse(401),
        retryCount: 0,
      });

      expect(result).toBeUndefined();
      expect(provider.refreshToken).not.toHaveBeenCalled();
    });

    it("커스텀 excludePaths 사용 시 기본 경로(/auth/login)에서는 refresh를 시도한다", async () => {
      const provider = createMockProvider();
      const { afterResponse } = createAuthHooks(provider, {
        excludePaths: ["/custom/no-refresh"],
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

      await afterResponse({
        request: makeRequest("https://api.example.com/auth/login"),
        options: makeOptions(),
        response: makeResponse(401),
        retryCount: 0,
      });

      // 기본 excludePaths가 아닌 커스텀만 적용되므로 /auth/login에서도 refresh 시도
      expect(provider.refreshToken).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });

    it("refresh 실패 후 다음 401에서 다시 refresh를 시도한다", async () => {
      let callCount = 0;
      const provider = createMockProvider({
        refreshToken: vi.fn(() => {
          callCount++;
          if (callCount === 1) return Promise.reject(new Error("FIRST_FAIL"));
          return Promise.resolve("recovered-token");
        }),
      });
      const { afterResponse } = createAuthHooks(provider);

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok"));

      const state = {
        options: makeOptions(),
        response: makeResponse(401),
        retryCount: 0 as const,
      };

      // 첫 번째 401 → refresh 실패
      await afterResponse({ ...state, request: makeRequest() });
      expect(provider.onRefreshFailure).toHaveBeenCalledTimes(1);
      expect(fetchSpy).not.toHaveBeenCalled();

      // 두 번째 401 → refresh 재시도 가능
      await afterResponse({ ...state, request: makeRequest() });
      expect(provider.refreshToken).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });
  });
});
