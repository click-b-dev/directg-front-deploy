import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionImageChkScreen } from "@screens/goods-option-image-chk";
import type { OptionImageChkSearch } from "@entities/goods-option";

// legacy pc/_Admin_/goods/goods_option_image_chk.php → /goods/goods_option_image_chk
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsOptionImageChkRoute = () => {
  const search = Route.useSearch();
  return <GoodsOptionImageChkScreen {...search} />;
};

export const Route = createFileRoute("/goods/goods_option_image_chk")({
  validateSearch: (search: Record<string, unknown>): OptionImageChkSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_status: str(search.search_status),
    search_domain: str(search.search_domain),
    search_is_view: str(search.search_is_view),
  }),
  component: GoodsOptionImageChkRoute,
});
