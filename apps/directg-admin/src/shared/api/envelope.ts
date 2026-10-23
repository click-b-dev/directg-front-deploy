// 서버 공통 응답 envelope: { success, code, message, content }.
// 실패(4xx/5xx)는 success=false + content=null 로 내려온다.
export type AppResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  content: T | null;
};

export class EnvelopeError extends Error {
  readonly name = "EnvelopeError" as const;

  constructor(
    public readonly status: number,
    public readonly code: string,
    /** API별로 지정한 사용자 노출 문구. 없으면 공통 문구(code 기준)를 쓴다. */
    public readonly userMessage?: string,
  ) {
    super(`[${status}] ${code}`);
  }
}

// 서버 code → 사용자 노출 메시지. 서버 message/code 원문은 화면에 노출하지 않는다.
const API_ERROR_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "잘못된 요청입니다. 입력값을 확인해 주세요.",
  UNAUTHORIZED: "인증이 만료되었습니다. 다시 로그인해 주세요.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "대상을 찾을 수 없습니다.",
  CONFLICT: "이미 존재하거나 사용 중인 항목입니다.",
  INTERNAL_SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

export const API_FALLBACK_MESSAGE = "처리에 실패했습니다. 잠시 후 다시 시도해 주세요.";

export const toApiErrorMessage = (error: unknown): string =>
  (error instanceof EnvelopeError && (error.userMessage ?? API_ERROR_MESSAGES[error.code])) ||
  API_FALLBACK_MESSAGE;

// API별 에러 문구: swagger에 명시된 code → 해당 API 맥락의 문구.
export type ApiErrorMessages = Partial<Record<string, string>>;

// envelope 요청을 content로 풀어준다. HTTP 에러/success=false 는 EnvelopeError로 통일,
// 네트워크 오류 등 envelope 없는 에러는 그대로 rethrow.
export const unwrapEnvelope = async <T>(
  request: Promise<AppResponse<T>>,
  errorMessages?: ApiErrorMessages,
): Promise<T> => {
  let result: AppResponse<T>;
  try {
    result = await request;
  } catch (error) {
    // ky v2: 에러 시 본문을 먼저 소비해 error.data에 담는다(response.json()은 사용 불가).
    const httpError = error as { response?: Response; data?: unknown } | null;
    if (httpError?.response) {
      const body = httpError.data as Partial<AppResponse<T>> | null | undefined;
      const code = typeof body?.code === "string" ? body.code : "UNKNOWN";
      throw new EnvelopeError(httpError.response.status, code, errorMessages?.[code]);
    }
    throw error;
  }
  if (!result.success) {
    throw new EnvelopeError(200, result.code, errorMessages?.[result.code]);
  }
  return result.content as T;
};
