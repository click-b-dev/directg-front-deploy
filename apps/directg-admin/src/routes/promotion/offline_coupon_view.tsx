import { createFileRoute } from "@tanstack/react-router";
import { OfflineCouponViewScreen } from "@screens/offline-coupon-view";
import type { OfflineCouponViewSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/offline_coupon_view.php → /promotion/offline_coupon_view
const str = (value: unknown) => (typeof value === "string" ? value : "");

const OfflineCouponViewRoute = () => {
  const search = Route.useSearch();
  return <OfflineCouponViewScreen {...search} />;
};

export const Route = createFileRoute("/promotion/offline_coupon_view")({
  validateSearch: (search: Record<string, unknown>): OfflineCouponViewSearch => ({
    sno: Number(search.sno) || 0,
    page: Number(search.page) || 1,
    searchTitle: str(search.searchTitle),
  }),
  component: OfflineCouponViewRoute,
});
