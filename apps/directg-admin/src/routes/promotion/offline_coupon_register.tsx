import { createFileRoute } from "@tanstack/react-router";
import { OfflineCouponRegisterScreen } from "@screens/offline-coupon-register";
import type { OfflineCouponRegisterSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/offline_coupon_register.php → /promotion/offline_coupon_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const OfflineCouponRegisterRoute = () => {
  const search = Route.useSearch();
  return <OfflineCouponRegisterScreen {...search} />;
};

export const Route = createFileRoute("/promotion/offline_coupon_register")({
  validateSearch: (search: Record<string, unknown>): OfflineCouponRegisterSearch => ({
    mode: str(search.mode),
    sno: Number(search.sno) || 0,
  }),
  component: OfflineCouponRegisterRoute,
});
