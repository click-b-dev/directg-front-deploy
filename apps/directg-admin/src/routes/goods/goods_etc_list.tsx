import { createFileRoute } from "@tanstack/react-router";
import { GoodsEtcListScreen } from "@screens/goods-etc-list";
import type { EtcSearch } from "@entities/goods-option";

// legacy pc/_Admin_/goods/goods_etc_list.php (?page&search_*) → /goods/goods_etc_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsEtcListRoute = () => {
  const search = Route.useSearch();
  return <GoodsEtcListScreen {...search} />;
};

export const Route = createFileRoute("/goods/goods_etc_list")({
  validateSearch: (search: Record<string, unknown>): EtcSearch => ({
    page: Number(search.page) || 1,
    search_product_code: str(search.search_product_code),
    search_product_name: str(search.search_product_name),
    search_product_name_en: str(search.search_product_name_en),
    search_supplier_code: str(search.search_supplier_code),
    search_product_platform: str(search.search_product_platform),
    search_status: str(search.search_status),
    search_is_view: str(search.search_is_view),
    search_delivery_type: str(search.search_delivery_type),
    search_soldout: str(search.search_soldout),
  }),
  component: GoodsEtcListRoute,
});
