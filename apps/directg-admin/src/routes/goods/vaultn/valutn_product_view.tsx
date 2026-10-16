import { createFileRoute } from "@tanstack/react-router";
import { VaultnProductViewScreen } from "@screens/vaultn-product-view";

// legacy pc/_Admin_/goods/vaultn/valutn_product_view.php → /goods/vaultn/valutn_product_view
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const VaultnProductViewRoute = () => {
  const { productGUID, page } = Route.useSearch();
  return <VaultnProductViewScreen productGUID={productGUID} page={page} />;
};

export const Route = createFileRoute("/goods/vaultn/valutn_product_view")({
  validateSearch: (search: Record<string, unknown>): { productGUID: string; page: number } => ({
    productGUID: str(search.productGUID),
    page: normPage(search.page),
  }),
  component: VaultnProductViewRoute,
});
