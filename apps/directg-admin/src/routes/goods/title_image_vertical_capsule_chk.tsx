import { createFileRoute } from "@tanstack/react-router";
import { GoodsTitleImageVerticalCapsuleChkScreen } from "@screens/goods-title-image-vertical-capsule-chk";
import type { TitleImageVerticalChkSearch } from "@entities/goods-title";

// legacy pc/_Admin_/goods/title_image_vertical_capsule_chk.php → /goods/title_image_vertical_capsule_chk
const str = (value: unknown) => (typeof value === "string" ? value : "");

const TitleImageVerticalCapsuleChkRoute = () => {
  const search = Route.useSearch();
  return <GoodsTitleImageVerticalCapsuleChkScreen {...search} />;
};

export const Route = createFileRoute("/goods/title_image_vertical_capsule_chk")({
  validateSearch: (search: Record<string, unknown>): TitleImageVerticalChkSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_is_view: str(search.search_is_view),
    search_sales_status: str(search.search_sales_status),
    search_domain: str(search.search_domain),
    search_is_hero: str(search.search_is_hero),
  }),
  component: TitleImageVerticalCapsuleChkRoute,
});
