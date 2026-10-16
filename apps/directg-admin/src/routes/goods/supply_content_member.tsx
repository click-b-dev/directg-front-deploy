import { createFileRoute } from "@tanstack/react-router";
import { GoodsSupplyContentMemberScreen } from "@screens/goods-supply-content-member";
import type { SupplyContentMemberSearch } from "@entities/supply-content";

// legacy pc/_Admin_/goods/supply_content_member.php → /goods/supply_content_member
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SupplyContentMemberRoute = () => {
  const search = Route.useSearch();
  return <GoodsSupplyContentMemberScreen {...search} />;
};

export const Route = createFileRoute("/goods/supply_content_member")({
  validateSearch: (search: Record<string, unknown>): SupplyContentMemberSearch => ({
    search_key: str(search.search_key),
    search_value: str(search.search_value),
  }),
  component: SupplyContentMemberRoute,
});
