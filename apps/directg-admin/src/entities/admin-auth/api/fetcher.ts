import { apiClient } from "@shared/api/client";
import type { AdminLoginRequest, AdminLoginResponse, AdminLogoutResponse } from "../model/types";

export const adminLogin = (payload: AdminLoginRequest) =>
  apiClient.post<AdminLoginResponse>("/admin/auth/login", payload);

// legacy logout.php: session_destroy 등가. 응답과 무관하게 호출측에서 로컬 세션을 파기한다.
export const adminLogout = () => apiClient.post<AdminLogoutResponse>("/admin/auth/logout");
