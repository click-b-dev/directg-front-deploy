import { createFileRoute } from "@tanstack/react-router";
import { PartnerReportRegisterScreen } from "@screens/partner-report-register";
import type { PartnerReportSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/report_register.php → /partner/report_register
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const PartnerReportRegisterRoute = () => {
  const search = Route.useSearch();
  return <PartnerReportRegisterScreen {...search} />;
};

export const Route = createFileRoute("/partner/report_register")({
  validateSearch: (search: Record<string, unknown>): PartnerReportSearch => ({
    publisher_code: str(search.publisher_code),
    search_report_term: str(search.search_report_term),
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    search_month_term: str(search.search_month_term),
    currency_converter: str(search.currency_converter),
    account_fee: str(search.account_fee),
    card_fee: str(search.card_fee),
    mobile_fee: str(search.mobile_fee),
    royalty: str(search.royalty),
    royalty_info: str(search.royalty_info),
  }),
  component: PartnerReportRegisterRoute,
});
