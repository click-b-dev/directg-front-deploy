import { describe, expect, it, vi } from "vitest";
import { HTTPError } from "ky";
import { ApiError } from "../error";
import { createErrorHook } from "./error";

const makeRequest = (url = "https://api.example.com/users") => new Request(url, { method: "GET" });

const makeHTTPError = (
  status: number,
  data: unknown,
  url = "https://api.example.com/users",
): HTTPError => {
  const request = makeRequest(url);
  const response = new Response(JSON.stringify(data), { status });
  const error = new HTTPError(response, request, {} as never);
  // ky v2의 HTTPError는 data 프로퍼티를 가지고 있음
  Object.defineProperty(error, "data", { value: data, writable: false });
  return error;
};

describe("createErrorHook", () => {
  const hook = createErrorHook();

  it("HTTPError를 ApiError로 변환한다 (서버 에러 본문 포함)", async () => {
    const serverBody = {
      code: "VALIDATION_ERROR",
      message: "입력값을 확인해주세요",
      timestamp: "2026-04-10T09:00:00+09:00",
    };
    const httpError = makeHTTPError(422, serverBody);

    const result = await hook({
      error: httpError,
      request: makeRequest(),
      options: {} as never,
      retryCount: 0,
    });

    expect(result).toBeInstanceOf(ApiError);
    const apiError = result as ApiError;
    expect(apiError.status).toBe(422);
    expect(apiError.code).toBe("VALIDATION_ERROR");
    expect(apiError.timestamp).toBe("2026-04-10T09:00:00+09:00");
    expect(apiError.data).toEqual(serverBody);
  });

  it("서버 에러 본문이 비표준이면 UNKNOWN_ERROR로 폴백한다", async () => {
    const httpError = makeHTTPError(500, { unexpected: "format" });

    const result = await hook({
      error: httpError,
      request: makeRequest(),
      options: {} as never,
      retryCount: 0,
    });

    const apiError = result as ApiError;
    expect(apiError.code).toBe("UNKNOWN_ERROR");
    expect(apiError.status).toBe(500);
  });

  it("data가 undefined이면 response.json()에서 파싱을 시도한다", async () => {
    const serverBody = {
      code: "SERVER_ERROR",
      message: "서버 에러",
      timestamp: "2026-04-10T09:00:00+09:00",
    };
    const httpError = makeHTTPError(500, serverBody);
    Object.defineProperty(httpError, "data", { value: undefined, writable: false });

    const result = await hook({
      error: httpError,
      request: makeRequest(),
      options: {} as never,
      retryCount: 0,
    });

    const apiError = result as ApiError;
    expect(apiError.code).toBe("SERVER_ERROR");
    expect(apiError.data).toEqual(serverBody);
  });

  it("data가 undefined이고 response.json()도 실패하면 UNKNOWN_ERROR로 폴백한다", async () => {
    const request = makeRequest();
    const response = new Response("not json", { status: 500 });
    const httpError = new HTTPError(response, request, {} as never);
    Object.defineProperty(httpError, "data", { value: undefined, writable: false });

    const result = await hook({
      error: httpError,
      request: makeRequest(),
      options: {} as never,
      retryCount: 0,
    });

    const apiError = result as ApiError;
    expect(apiError.code).toBe("UNKNOWN_ERROR");
    expect(apiError.data).toBeNull();
  });

  it("네트워크 에러(HTTPError가 아닌 경우) → status 0, NETWORK_ERROR", async () => {
    vi.useFakeTimers({ now: new Date("2026-04-10T00:00:00Z") });

    const networkError = new TypeError("Failed to fetch");
    const result = await hook({
      error: networkError,
      request: makeRequest("https://api.example.com/health"),
      options: {} as never,
      retryCount: 0,
    });

    const apiError = result as ApiError;
    expect(apiError.status).toBe(0);
    expect(apiError.code).toBe("NETWORK_ERROR");
    expect(apiError.isNetworkError).toBe(true);
    expect(apiError.url).toBe("https://api.example.com/health");

    vi.useRealTimers();
  });
});
