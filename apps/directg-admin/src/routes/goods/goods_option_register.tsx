import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionRegisterScreen } from "@screens/goods-option-register";

// legacy pc/_Admin_/goods/goods_option_register.php?product_code= → /goods/goods_option_register
type Search = { product_code: string };

const GoodsOptionRegisterRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionRegisterScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionRegisterRoute,
});
