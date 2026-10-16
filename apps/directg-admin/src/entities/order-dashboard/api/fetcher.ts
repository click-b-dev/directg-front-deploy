import { apiClient } from "@shared/api/client";
import type { OrderDashboard } from "../model/types";

// legacy yjs_dashboard_order.php — 처리 필요 6 카운트 스냅샷(read-only). 실제 6 SQL은 백엔드.
export const fetchOrderDashboard = () => apiClient.get<OrderDashboard>("/admin/order/dashboard");
