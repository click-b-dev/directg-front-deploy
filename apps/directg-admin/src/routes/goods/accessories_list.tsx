import { createFileRoute } from "@tanstack/react-router";
import { GoodsAccessoriesListScreen } from "@screens/goods-accessories-list";
import type { AccessoriesSearch } from "@entities/goods-title";

// legacy pc/_Admin_/goods/accessories_list.php (?page&search_*) → /goods/accessories_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AccessoriesListRoute = () => {
  const search = Route.useSearch();
  return <GoodsAccessoriesListScreen {...search} />;
};

export const Route = createFileRoute("/goods/accessories_list")({
  validateSearch: (search: Record<string, unknown>): AccessoriesSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_age_limit: str(search.search_age_limit),
    search_is_view: str(search.search_is_view),
    search_sales_status: str(search.search_sales_status),
  }),
  component: AccessoriesListRoute,
});
