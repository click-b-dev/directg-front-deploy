import { createFileRoute } from "@tanstack/react-router";
import { PartnerMemberListScreen } from "@screens/partner-member-list";
import type { PartnerMemberListSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/partner_list.php → /partner/partner_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerListRoute = () => {
  const search = Route.useSearch();
  return <PartnerMemberListScreen {...search} />;
};

export const Route = createFileRoute("/partner/partner_list")({
  validateSearch: (search: Record<string, unknown>): PartnerMemberListSearch => ({
    page: Number(search.page) || 1,
    search_publisher_name: str(search.search_publisher_name),
    report_term: str(search.report_term),
    is_system: str(search.is_system),
  }),
  component: PartnerListRoute,
});
