import { createFileRoute } from "@tanstack/react-router";
import { StockVaultnStockScreen } from "@screens/stock-vaultn-stock";

// legacy pc/_Admin_/goods/stock/vaultn_stock.php → /goods/stock/vaultn_stock
// (#139 goods/vaultn/vaultn_stock.php와 별개 화면 — 전량 로드·클라이언트 필터/정렬/페이징)
export const Route = createFileRoute("/goods/stock/vaultn_stock")({
  component: StockVaultnStockScreen,
});
