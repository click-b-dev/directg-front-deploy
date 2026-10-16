import { createFileRoute } from "@tanstack/react-router";
import { GenbaTitleScreen } from "@screens/genba-title";
import type { GenbaTitleSearch } from "@entities/genba";

// legacy pc/_Admin_/goods/genba/genba_title.php → /goods/genba/genba_title
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GenbaTitleRoute = () => {
  const search = Route.useSearch();
  return <GenbaTitleScreen {...search} />;
};

export const Route = createFileRoute("/goods/genba/genba_title")({
  validateSearch: (search: Record<string, unknown>): GenbaTitleSearch => ({
    page: Number(search.page) || 1,
    search_product_id: str(search.search_product_id),
    search_publisher: str(search.search_publisher),
    search_name: str(search.search_name),
  }),
  component: GenbaTitleRoute,
});
