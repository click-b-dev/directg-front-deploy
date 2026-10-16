import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionDescriptionV2Screen } from "@screens/goods-option-description-v2";

// legacy pc/_Admin_/goods/goods_option_description_register_v2.php?product_code= → /goods/goods_option_description_register_v2
type Search = { product_code: string };

const GoodsOptionDescriptionV2Route = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionDescriptionV2Screen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_description_register_v2")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionDescriptionV2Route,
});
