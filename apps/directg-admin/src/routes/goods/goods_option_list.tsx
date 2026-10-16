import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionListScreen, type OptionListSearch } from "@screens/goods-option-list";

// legacy pc/_Admin_/goods/goods_option_list.php (?page&search_*) → /goods/goods_option_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsOptionListRoute = () => {
  const search = Route.useSearch();
  return <GoodsOptionListScreen {...search} />;
};

export const Route = createFileRoute("/goods/goods_option_list")({
  validateSearch: (search: Record<string, unknown>): OptionListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_status: str(search.search_status),
    search_product_platform: str(search.search_product_platform),
    search_supplier_code: str(search.search_supplier_code),
    search_game_type: str(search.search_game_type),
    search_is_view: str(search.search_is_view),
    search_display_type: str(search.search_display_type),
    search_interface_korean: str(search.search_interface_korean),
    search_subtitle_korean: str(search.search_subtitle_korean),
    search_spoken_korean: str(search.search_spoken_korean),
    search_exclusive_korean: str(search.search_exclusive_korean),
    search_is_preorder: str(search.search_is_preorder),
    search_is_bonus: str(search.search_is_bonus),
    search_is_naverpay_coupon: str(search.search_is_naverpay_coupon),
    search_is_auth: str(search.search_is_auth),
    search_soldout: str(search.search_soldout),
  }),
  component: GoodsOptionListRoute,
});
