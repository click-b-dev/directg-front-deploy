import { describe, expect, it } from "vitest";
import { ApiError, isApiErrorResponse } from "./error";

describe("ApiError", () => {
  it("status, code, timestamp, data, url을 보존한다", () => {
    const error = new ApiError(404, "NOT_FOUND", "2026-04-10T00:00:00+09:00", null, "/api/users");

    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.timestamp).toBe("2026-04-10T00:00:00+09:00");
    expect(error.data).toBeNull();
    expect(error.url).toBe("/api/users");
    expect(error.name).toBe("ApiError");
    expect(error.message).toBe("[404] NOT_FOUND");
  });

  it("Error를 상속한다", () => {
    const error = new ApiError(500, "SERVER_ERROR", "", null, "");
    expect(error).toBeInstanceOf(Error);
  });

  it.each([
    { status: 401, getter: "isUnauthorized" as const },
    { status: 403, getter: "isForbidden" as const },
    { status: 404, getter: "isNotFound" as const },
    { status: 422, getter: "isValidation" as const },
    { status: 500, getter: "isServerError" as const },
    { status: 502, getter: "isServerError" as const },
    { status: 0, getter: "isNetworkError" as const },
  ])("status $status → $getter가 true를 반환한다", ({ status, getter }) => {
    const error = new ApiError(status, "CODE", "", null, "");
    expect(error[getter]).toBe(true);
  });

  it("해당하지 않는 status에 대해 getter가 false를 반환한다", () => {
    const error = new ApiError(200, "OK", "", null, "");
    expect(error.isUnauthorized).toBe(false);
    expect(error.isForbidden).toBe(false);
    expect(error.isNotFound).toBe(false);
    expect(error.isValidation).toBe(false);
    expect(error.isServerError).toBe(false);
    expect(error.isNetworkError).toBe(false);
  });

  it("data에 원본 에러 payload를 보존한다", () => {
    const payload = { code: "VALIDATION_ERROR", message: "입력값 오류", timestamp: "2026-04-10" };
    const error = new ApiError(422, payload.code, payload.timestamp, payload, "/api/users");
    expect(error.data).toEqual(payload);
  });
});

describe("isApiErrorResponse", () => {
  it("code, message, timestamp이 모두 string이면 true", () => {
    expect(
      isApiErrorResponse({ code: "NOT_FOUND", message: "찾을 수 없음", timestamp: "2026-04-10" }),
    ).toBe(true);
  });

  it("timestamp이 없으면 false", () => {
    expect(isApiErrorResponse({ code: "NOT_FOUND", message: "찾을 수 없음" })).toBe(false);
  });

  it("code가 없으면 false", () => {
    expect(isApiErrorResponse({ message: "에러", timestamp: "2026-04-10" })).toBe(false);
  });

  it("message가 없으면 false", () => {
    expect(isApiErrorResponse({ code: "ERROR", timestamp: "2026-04-10" })).toBe(false);
  });

  it.each([null, undefined, 42, "string", []])("원시값/배열(%j)에 대해 false", (value) => {
    expect(isApiErrorResponse(value)).toBe(false);
  });

  it("code가 string이 아니면 false", () => {
    expect(isApiErrorResponse({ code: 123, message: "에러", timestamp: "2026-04-10" })).toBe(false);
  });
});
