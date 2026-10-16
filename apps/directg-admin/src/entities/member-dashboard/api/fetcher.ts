import { apiClient } from "@shared/api/client";
import type { MemberDashboard } from "../model/types";

// legacy dashboard_crm.php — 집계 스냅샷(read-only). refresh=1이면 백엔드 캐시 무시 강제 재계산.
export const fetchMemberDashboard = (refresh = false) =>
  apiClient.get<MemberDashboard>(`/admin/member/dashboard?refresh=${refresh ? 1 : 0}`);
