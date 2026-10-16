import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionCategoryScreen } from "@screens/goods-option-category";

// legacy pc/_Admin_/goods/goods_option_category_register.php?product_code= → /goods/goods_option_category_register
type Search = { product_code: string };

const GoodsOptionCategoryRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionCategoryScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_category_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionCategoryRoute,
});
