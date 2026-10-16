import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionImageScreen } from "@screens/goods-option-image";

// legacy pc/_Admin_/goods/goods_option_image_register.php?product_code= → /goods/goods_option_image_register
type Search = { product_code: string };

const GoodsOptionImageRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionImageScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_image_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionImageRoute,
});
