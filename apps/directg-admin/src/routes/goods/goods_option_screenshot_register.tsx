import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionScreenshotScreen } from "@screens/goods-option-screenshot";

// legacy pc/_Admin_/goods/goods_option_screenshot_register.php?product_code= → /goods/goods_option_screenshot_register
type Search = { product_code: string };

const GoodsOptionScreenshotRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionScreenshotScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_screenshot_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionScreenshotRoute,
});
