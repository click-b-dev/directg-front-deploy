import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { OrderDashboard } from "@entities/order-dashboard";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy yjs_dashboard_order.php — 처리 필요 6 카운트 스냅샷(read-only). 실제 6 SQL은 백엔드.
// mock은 고정 payload. 세 색상 상태 시연: >0(danger)·0(muted)·null(집계실패 warning).
const dashboard: OrderDashboard = {
  key_fail: 3, // >0 → danger
  cancel_req: 5, // >0 → danger
  vbank: 0, // 0 → muted
  ship_pending: 2, // >0 → danger
  no_system: 0, // 0 → muted
  pn_book: null, // null → warning('-')
};

export const orderDashboardHandlers = [
  http.get(api("/admin/order/dashboard"), () => HttpResponse.json(dashboard)),
];
