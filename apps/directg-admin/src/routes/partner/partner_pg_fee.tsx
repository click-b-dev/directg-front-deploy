import { createFileRoute } from "@tanstack/react-router";
import { PartnerPgFeeScreen } from "@screens/partner-pg-fee";
import type { PartnerPgFeeSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/partner_pg_fee.php → /partner/partner_pg_fee
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerPgFeeRoute = () => {
  const search = Route.useSearch();
  return <PartnerPgFeeScreen {...search} />;
};

export const Route = createFileRoute("/partner/partner_pg_fee")({
  validateSearch: (search: Record<string, unknown>): PartnerPgFeeSearch => ({
    page: Number(search.page) || 1,
    search_publisher_name: str(search.search_publisher_name),
  }),
  component: PartnerPgFeeRoute,
});
