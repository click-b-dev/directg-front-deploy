// 서버 응답 code → 사용자 노출 메시지. 서버 message/code 원문은 화면에 노출하지 않는다.
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "아이디 또는 비밀번호가 올바르지 않습니다.",
  FORBIDDEN: "접근 권한이 없는 계정입니다.",
};

export const LOGIN_FALLBACK_MESSAGE = "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";

export const toLoginErrorMessage = (code?: string | null): string =>
  (code && LOGIN_ERROR_MESSAGES[code]) || LOGIN_FALLBACK_MESSAGE;
