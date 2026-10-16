import { isHTTPError, type BeforeErrorHook } from "ky";
import { ApiError, isApiErrorResponse } from "../error";

export const createErrorHook = (): BeforeErrorHook => {
  return async ({ error, request }) => {
    if (!isHTTPError(error)) {
      return new ApiError(0, "NETWORK_ERROR", new Date().toISOString(), null, request.url);
    }

    // error.data가 없을 수 있으므로 response.json() 폴백으로 서버 에러 본문을 안전하게 파싱
    const data = error.data ?? (await error.response.json().catch(() => null));
    const code = isApiErrorResponse(data) ? data.code : "UNKNOWN_ERROR";
    const timestamp = isApiErrorResponse(data) ? data.timestamp : new Date().toISOString();

    return new ApiError(error.response.status, code, timestamp, data, request.url);
  };
};
