import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionScreenshotChkScreen } from "@screens/goods-option-screenshot-chk";
import type { OptionScreenshotChkSearch } from "@entities/goods-option";

// legacy pc/_Admin_/goods/goods_option_screenshot_chk.php → /goods/goods_option_screenshot_chk
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsOptionScreenshotChkRoute = () => {
  const search = Route.useSearch();
  return <GoodsOptionScreenshotChkScreen {...search} />;
};

export const Route = createFileRoute("/goods/goods_option_screenshot_chk")({
  validateSearch: (search: Record<string, unknown>): OptionScreenshotChkSearch => ({
    page: Number(search.page) || 1,
    search_product_code: str(search.search_product_code),
    search_product_name: str(search.search_product_name),
    search_appid: str(search.search_appid),
  }),
  component: GoodsOptionScreenshotChkRoute,
});
