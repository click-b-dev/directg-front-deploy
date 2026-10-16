import { createFileRoute } from "@tanstack/react-router";
import { VaultnStockScreen } from "@screens/vaultn-stock";

// legacy pc/_Admin_/goods/vaultn/vaultn_stock.php → /goods/vaultn/vaultn_stock
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const VaultnStockRoute = () => {
  const { page } = Route.useSearch();
  return <VaultnStockScreen page={page} />;
};

export const Route = createFileRoute("/goods/vaultn/vaultn_stock")({
  validateSearch: (search: Record<string, unknown>): { page: number } => ({
    page: normPage(search.page),
  }),
  component: VaultnStockRoute,
});
