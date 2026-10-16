import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionPackageScreen } from "@screens/goods-option-package";

// legacy pc/_Admin_/goods/goods_option_package_register.php?product_code= → /goods/goods_option_package_register
type Search = { product_code: string };

const GoodsOptionPackageRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionPackageScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_package_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionPackageRoute,
});
