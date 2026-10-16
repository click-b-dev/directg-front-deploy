import { createFileRoute } from "@tanstack/react-router";
import { GoodsSupplyContentScreen } from "@screens/goods-supply-content";
import type { SupplyContentSearch } from "@entities/supply-content";

// legacy pc/_Admin_/goods/supply_content.php → /goods/supply_content
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SupplyContentRoute = () => {
  const search = Route.useSearch();
  return <GoodsSupplyContentScreen {...search} />;
};

export const Route = createFileRoute("/goods/supply_content")({
  validateSearch: (search: Record<string, unknown>): SupplyContentSearch => ({
    page: Number(search.page) || 1,
    search_value: str(search.search_value),
    search_supply_content_type: str(search.search_supply_content_type),
    search_is_encode: str(search.search_is_encode),
  }),
  component: SupplyContentRoute,
});
