import { createFileRoute } from "@tanstack/react-router";
import { GoodsTitleImageHeaderChkScreen } from "@screens/goods-title-image-header-chk";
import type { TitleImageChkSearch } from "@entities/goods-title";

// legacy pc/_Admin_/goods/title_image_header_chk.php → /goods/title_image_header_chk
const str = (value: unknown) => (typeof value === "string" ? value : "");

const TitleImageHeaderChkRoute = () => {
  const search = Route.useSearch();
  return <GoodsTitleImageHeaderChkScreen {...search} />;
};

export const Route = createFileRoute("/goods/title_image_header_chk")({
  validateSearch: (search: Record<string, unknown>): TitleImageChkSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_is_view: str(search.search_is_view),
    search_sales_status: str(search.search_sales_status),
    search_domain: str(search.search_domain),
  }),
  component: TitleImageHeaderChkRoute,
});
