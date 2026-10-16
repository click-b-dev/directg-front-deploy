import { createFileRoute } from "@tanstack/react-router";
import { PartnerReportViewScreen } from "@screens/partner-report-view";
import type { PartnerReportViewSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/report_view.php → /partner/report_view
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerReportViewRoute = () => {
  const search = Route.useSearch();
  return <PartnerReportViewScreen {...search} />;
};

export const Route = createFileRoute("/partner/report_view")({
  validateSearch: (search: Record<string, unknown>): PartnerReportViewSearch => ({
    idx: str(search.idx),
  }),
  component: PartnerReportViewRoute,
});
