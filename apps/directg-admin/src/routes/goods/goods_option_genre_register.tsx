import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionGenreScreen } from "@screens/goods-option-genre";

// legacy pc/_Admin_/goods/goods_option_genre_register.php?product_code= → /goods/goods_option_genre_register
type Search = { product_code: string };

const GoodsOptionGenreRoute = () => {
  const { product_code } = Route.useSearch();
  return <GoodsOptionGenreScreen productCode={product_code} />;
};

export const Route = createFileRoute("/goods/goods_option_genre_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    product_code: typeof search.product_code === "string" ? search.product_code : "",
  }),
  component: GoodsOptionGenreRoute,
});
