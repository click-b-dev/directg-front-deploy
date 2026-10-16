import { createFileRoute } from "@tanstack/react-router";
import { PartnerCodeScreen } from "@screens/partner-code";
import type { PartnerListSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/partner_code.php → /partner/partner_code
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerCodeRoute = () => {
  const search = Route.useSearch();
  return <PartnerCodeScreen {...search} />;
};

export const Route = createFileRoute("/partner/partner_code")({
  validateSearch: (search: Record<string, unknown>): PartnerListSearch => ({
    page: Number(search.page) || 1,
    search_publisher_name: str(search.search_publisher_name),
    report_term: str(search.report_term),
    is_system: str(search.is_system),
  }),
  component: PartnerCodeRoute,
});
