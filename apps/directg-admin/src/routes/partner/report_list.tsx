import { createFileRoute } from "@tanstack/react-router";
import { PartnerReportListScreen } from "@screens/partner-report-list";
import type { PartnerReportListSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/report_list.php → /partner/report_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerReportListRoute = () => {
  const search = Route.useSearch();
  return <PartnerReportListScreen {...search} />;
};

export const Route = createFileRoute("/partner/report_list")({
  validateSearch: (search: Record<string, unknown>): PartnerReportListSearch => ({
    search_publisher_code: str(search.search_publisher_code),
    search_report_term: str(search.search_report_term),
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    search_month_term: str(search.search_month_term),
  }),
  component: PartnerReportListRoute,
});
