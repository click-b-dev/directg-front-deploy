import { createFileRoute } from "@tanstack/react-router";
import { PartnerSalesListScreen } from "@screens/partner-sales-list";
import type { PartnerSalesListSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/sales_list.php → /partner/sales_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerSalesListRoute = () => {
  const search = Route.useSearch();
  return <PartnerSalesListScreen {...search} />;
};

export const Route = createFileRoute("/partner/sales_list")({
  validateSearch: (search: Record<string, unknown>): PartnerSalesListSearch => ({
    search_publisher_code: str(search.search_publisher_code),
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: PartnerSalesListRoute,
});
