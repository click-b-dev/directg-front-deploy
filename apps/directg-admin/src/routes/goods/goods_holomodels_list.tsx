import { createFileRoute } from "@tanstack/react-router";
import { GoodsHolomodelsListScreen } from "@screens/goods-holomodels-list";
import type { HolomodelsSearch } from "@entities/goods-option";

// legacy pc/_Admin_/goods/goods_holomodels_list.php (?page&search_*) → /goods/goods_holomodels_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsHolomodelsListRoute = () => {
  const search = Route.useSearch();
  return <GoodsHolomodelsListScreen {...search} />;
};

export const Route = createFileRoute("/goods/goods_holomodels_list")({
  validateSearch: (search: Record<string, unknown>): HolomodelsSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_status: str(search.search_status),
    search_supplier_code: str(search.search_supplier_code),
    search_product_platform: str(search.search_product_platform),
    search_game_type: str(search.search_game_type),
    search_display_type: str(search.search_display_type),
    search_is_view: str(search.search_is_view),
    search_soldout: str(search.search_soldout),
    search_is_bonus: str(search.search_is_bonus),
    search_is_preorder: str(search.search_is_preorder),
    search_is_naverpay_coupon: str(search.search_is_naverpay_coupon),
    search_interface_korean: str(search.search_interface_korean),
    search_subtitle_korean: str(search.search_subtitle_korean),
    search_spoken_korean: str(search.search_spoken_korean),
    search_exclusive_korean: str(search.search_exclusive_korean),
  }),
  component: GoodsHolomodelsListRoute,
});
