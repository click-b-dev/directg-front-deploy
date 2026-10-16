import { createFileRoute } from "@tanstack/react-router";
import {
  GenbaAvaliabilityScreen,
  type GenbaAvaliabilitySearchProps,
} from "@screens/genba-avaliability";

// legacy pc/_Admin_/goods/stock/genba_avaliability.php → /goods/stock/genba_avaliability
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GenbaAvaliabilityRoute = () => {
  const search = Route.useSearch();
  return <GenbaAvaliabilityScreen {...search} />;
};

export const Route = createFileRoute("/goods/stock/genba_avaliability")({
  validateSearch: (search: Record<string, unknown>): GenbaAvaliabilitySearchProps => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
  }),
  component: GenbaAvaliabilityRoute,
});
