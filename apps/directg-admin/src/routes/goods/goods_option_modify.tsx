import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionModifyScreen } from "@screens/goods-option-modify";

// legacy pc/_Admin_/goods/goods_option_modify.php?product_code= → /goods/goods_option_modify
type Search = { product_code: string };

const GoodsOptionModifyRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionModifyScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_modify")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionModifyRoute,
});
