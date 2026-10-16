import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionViewScreen } from "@screens/goods-option-view";

// legacy pc/_Admin_/goods/goods_option_view.php?product_code= → /goods/goods_option_view
type Search = { product_code: string };

const GoodsOptionViewRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionViewScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_view")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionViewRoute,
});
