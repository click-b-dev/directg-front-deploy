import { apiClient } from "@shared/api/client";
import type { StockDashboard } from "../model/types";

// legacy dashboard_stock.php — 3목록 스냅샷(read-only). 2 SQL + PHP 분류·정렬은 백엔드.
export const fetchStockDashboard = () =>
  apiClient.get<StockDashboard>("/admin/goods/stock/dashboard");
