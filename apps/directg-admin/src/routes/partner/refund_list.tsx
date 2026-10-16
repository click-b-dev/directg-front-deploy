import { createFileRoute } from "@tanstack/react-router";
import { PartnerRefundListScreen } from "@screens/partner-refund-list";
import type { PartnerRefundListSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/refund_list.php → /partner/refund_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerRefundListRoute = () => {
  const search = Route.useSearch();
  return <PartnerRefundListScreen {...search} />;
};

export const Route = createFileRoute("/partner/refund_list")({
  validateSearch: (search: Record<string, unknown>): PartnerRefundListSearch => ({
    search_publisher_code: str(search.search_publisher_code),
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: PartnerRefundListRoute,
});
