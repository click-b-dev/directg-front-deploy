import { apiClient } from "@shared/api/client";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminLogoutResponse,
  AdminRole,
} from "../model/types";

// 401/403은 ky HTTPError로 throw되지만 본문이 {success:false, code, message} envelope이므로
// 호출측이 분기할 수 있게 본문을 그대로 반환한다. envelope이 아닌 에러(네트워크/5xx 등)는 rethrow.
export const adminLogin = async (payload: AdminLoginRequest): Promise<AdminLoginResponse> => {
  try {
    return await apiClient.post<AdminLoginResponse>("/admin/login", payload);
  } catch (error) {
    // ky v2: 에러 시 본문이 error.data에 담긴다(response.json() 사용 불가).
    const httpError = error as { response?: Response; data?: unknown } | null;
    const status = httpError?.response?.status;
    const body = httpError?.data as AdminLoginResponse | null | undefined;
    if ((status === 401 || status === 403) && body && body.success === false) return body;
    throw error;
  }
};

// 기존 화면 가드(use-super-admin 등)는 legacy admin_level 문자열("99"/"1") 비교이므로,
// 서버 role enum을 session.user.role로 옮길 때 변환한다.
// TODO(백엔드 확인): legacy "1"(상품뷰어)에 대응하는 role 미확정 → 매핑 없음.
export const toSessionRole = (role: AdminRole): string => (role === "SUPER_ADMIN" ? "99" : role);

// legacy logout.php: session_destroy 등가. 응답과 무관하게 호출측에서 로컬 세션을 파기한다.
export const adminLogout = () => apiClient.post<AdminLogoutResponse>("/admin/auth/logout");
