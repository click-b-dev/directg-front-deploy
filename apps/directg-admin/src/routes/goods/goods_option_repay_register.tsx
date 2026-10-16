import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionRepayScreen } from "@screens/goods-option-repay";

// legacy pc/_Admin_/goods/goods_option_repay_register.php?product_code= → /goods/goods_option_repay_register
type Search = { product_code: string };

const GoodsOptionRepayRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionRepayScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_repay_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionRepayRoute,
});
