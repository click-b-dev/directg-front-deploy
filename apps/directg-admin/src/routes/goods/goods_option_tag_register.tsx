import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionTagScreen } from "@screens/goods-option-tag";

// legacy pc/_Admin_/goods/goods_option_tag_register.php?product_code= → /goods/goods_option_tag_register
type Search = { product_code: string };

const GoodsOptionTagRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionTagScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_tag_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionTagRoute,
});
