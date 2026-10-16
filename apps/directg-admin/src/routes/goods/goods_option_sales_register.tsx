import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionSalesScreen } from "@screens/goods-option-sales";

// legacy pc/_Admin_/goods/goods_option_sales_register.php?product_code= → /goods/goods_option_sales_register
type Search = { product_code: string };

const GoodsOptionSalesRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionSalesScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_sales_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionSalesRoute,
});
