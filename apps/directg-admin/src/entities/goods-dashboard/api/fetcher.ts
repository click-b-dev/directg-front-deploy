import { apiClient } from "@shared/api/client";
import type { GoodsDashboard } from "../model/types";

// legacy dashboard_goods.php — 6패널 스냅샷(read-only).
export const fetchGoodsDashboard = () => apiClient.get<GoodsDashboard>("/admin/goods/dashboard");
