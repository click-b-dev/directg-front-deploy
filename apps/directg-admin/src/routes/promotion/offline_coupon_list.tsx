import { createFileRoute } from "@tanstack/react-router";
import { OfflineCouponListScreen } from "@screens/offline-coupon-list";
import type { OfflineCouponListSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/offline_coupon_list.php → /promotion/offline_coupon_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const OfflineCouponListRoute = () => {
  const search = Route.useSearch();
  return <OfflineCouponListScreen {...search} />;
};

export const Route = createFileRoute("/promotion/offline_coupon_list")({
  validateSearch: (search: Record<string, unknown>): OfflineCouponListSearch => ({
    page: Number(search.page) || 1,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: OfflineCouponListRoute,
});
