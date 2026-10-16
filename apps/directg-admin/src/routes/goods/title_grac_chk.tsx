import { createFileRoute } from "@tanstack/react-router";
import { GoodsTitleGracChkScreen } from "@screens/goods-title-grac-chk";
import type { GracChkSearch } from "@entities/goods-title";

// legacy pc/_Admin_/goods/title_grac_chk.php (?page&search_age_limit) → /goods/title_grac_chk
const str = (value: unknown) => (typeof value === "string" ? value : "");

const TitleGracChkRoute = () => {
  const search = Route.useSearch();
  return <GoodsTitleGracChkScreen {...search} />;
};

export const Route = createFileRoute("/goods/title_grac_chk")({
  validateSearch: (search: Record<string, unknown>): GracChkSearch => ({
    page: Number(search.page) || 1,
    search_age_limit: str(search.search_age_limit),
  }),
  component: TitleGracChkRoute,
});
