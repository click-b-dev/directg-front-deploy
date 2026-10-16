import { createFileRoute } from "@tanstack/react-router";
import { GoodsGracListScreen } from "@screens/goods-grac-list";
import type { GracListSearch } from "@entities/grac";

// legacy pc/_Admin_/goods/grac/grac_list.php → /goods/grac/grac_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GracListRoute = () => {
  const search = Route.useSearch();
  return <GoodsGracListScreen {...search} />;
};

export const Route = createFileRoute("/goods/grac/grac_list")({
  validateSearch: (search: Record<string, unknown>): GracListSearch => ({
    page: Number(search.page) || 1,
    search_rateno: str(search.search_rateno),
    search_gametitle: str(search.search_gametitle),
    search_entname: str(search.search_entname),
    search_orgname: str(search.search_orgname),
    search_givenrate: str(search.search_givenrate),
    search_platform: str(search.search_platform),
  }),
  component: GracListRoute,
});
