import { createFileRoute } from "@tanstack/react-router";
import { GoodsOptionEndScreen } from "@screens/goods-option-end";
import type { OptionEndSearch } from "@entities/goods-option";

// legacy pc/_Admin_/goods/goods_option_end.php (?page&search_*) → /goods/goods_option_end
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsOptionEndRoute = () => {
  const search = Route.useSearch();
  return <GoodsOptionEndScreen {...search} />;
};

export const Route = createFileRoute("/goods/goods_option_end")({
  validateSearch: (search: Record<string, unknown>): OptionEndSearch => ({
    page: Number(search.page) || 1,
    search_product_code: str(search.search_product_code),
    search_product_name: str(search.search_product_name),
    search_product_name_en: str(search.search_product_name_en),
    search_supplier_code: str(search.search_supplier_code),
    search_product_platform: str(search.search_product_platform),
    search_game_type: str(search.search_game_type),
    search_is_view: str(search.search_is_view),
    search_status: str(search.search_status),
    search_is_special: str(search.search_is_special),
    search_interface_korean: str(search.search_interface_korean),
    search_spoken_korean: str(search.search_spoken_korean),
    search_exclusive_korean: str(search.search_exclusive_korean),
  }),
  component: GoodsOptionEndRoute,
});
