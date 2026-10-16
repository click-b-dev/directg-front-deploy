import { createFileRoute } from "@tanstack/react-router";
import { PartnerReportListUseScreen } from "@screens/partner-report-list-use";
import type { PartnerReportListSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/report_list_use.php → /partner/report_list_use (사이드바 외 직접 URL)
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerReportListUseRoute = () => {
  const search = Route.useSearch();
  return <PartnerReportListUseScreen {...search} />;
};

export const Route = createFileRoute("/partner/report_list_use")({
  validateSearch: (search: Record<string, unknown>): PartnerReportListSearch => ({
    search_publisher_code: str(search.search_publisher_code),
    search_report_term: str(search.search_report_term),
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    search_month_term: str(search.search_month_term),
  }),
  component: PartnerReportListUseRoute,
});
