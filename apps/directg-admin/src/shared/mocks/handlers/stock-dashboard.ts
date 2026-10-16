import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { StockDashboard } from "@entities/stock-dashboard";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy dashboard_stock.php — read-only 스냅샷. 실제 2 SQL·분류·정렬·order_system 라벨은 백엔드.
// mock은 고정 payload(CRUD 아님).
// selling_stock_zero: soldout N(미품절, table-danger 강조) 먼저 → Y 순으로 서버 정렬된 형태.
const dashboard: StockDashboard = {
  selling_stock_zero: [
    {
      product_code: "DG30001",
      product_name: "젤다의 전설 티어스 오브 더 킹덤",
      status: "0",
      soldout: "N",
      item_id: "A5001",
      item_name: "Zelda TOTK Standard",
      item_publisher: "Nintendo",
    },
    {
      product_code: "DG30002",
      product_name: "슈퍼마리오 브라더스 원더",
      status: "0",
      soldout: "N",
      item_id: "A5002",
      item_name: "Mario Wonder Standard",
      item_publisher: "Nintendo",
    },
    {
      product_code: "DG30003",
      product_name: "메트로이드 프라임 리마스터드",
      status: "0",
      soldout: "Y",
      item_id: "A5003",
      item_name: "Metroid Prime Remastered",
      item_publisher: "Nintendo",
    },
  ],
  not_selling_stock_zero: [
    {
      product_code: "DG30010",
      product_name: "판매중지된 구작 A",
      status: "1",
      soldout: "Y",
      item_id: "A5010",
      item_name: "Legacy Title A",
      item_publisher: "Bandai Namco",
    },
    {
      product_code: "DG30011",
      product_name: "승인대기 신작 B",
      status: "9",
      soldout: "N",
      item_id: "A5011",
      item_name: "Pending Title B",
      item_publisher: "Capcom",
    },
  ],
  selling_soldout: [
    {
      product_code: "DG30020",
      product_name: "발더스 게이트 3 (Ztorm)",
      order_system_label: "Ztorm API",
    },
    {
      product_code: "DG30021",
      product_name: "엘든 링 (배송시스템 미매핑)",
      order_system_label: "-",
    },
  ],
};

export const stockDashboardHandlers = [
  http.get(api("/admin/goods/stock/dashboard"), () => HttpResponse.json(dashboard)),
];
