import { createFileRoute } from "@tanstack/react-router";
import { OrderAssetSuccessScreen } from "@screens/order-asset-success";
import type { OrderAssetSuccessSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_asset_success.php → /order/order_asset_success
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderAssetSuccessRoute = () => {
  const search = Route.useSearch();
  return <OrderAssetSuccessScreen {...search} />;
};

export const Route = createFileRoute("/order/order_asset_success")({
  validateSearch: (search: Record<string, unknown>): OrderAssetSuccessSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderAssetSuccessRoute,
});
