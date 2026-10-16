import type { ApiErrorResponse } from "@click-b/types";

export class ApiError extends Error {
  readonly name = "ApiError" as const;

  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly timestamp: string,
    public readonly data: unknown,
    public readonly url: string,
  ) {
    super(`[${status}] ${code}`);
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidation() {
    return this.status === 422;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

export const isApiErrorResponse = (value: unknown): value is ApiErrorResponse =>
  typeof value === "object" &&
  value !== null &&
  "code" in value &&
  typeof (value as ApiErrorResponse).code === "string" &&
  "message" in value &&
  typeof (value as ApiErrorResponse).message === "string" &&
  "timestamp" in value &&
  typeof (value as ApiErrorResponse).timestamp === "string";
