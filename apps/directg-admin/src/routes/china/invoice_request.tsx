import { createFileRoute } from "@tanstack/react-router";
import { ChinaInvoiceRequestScreen } from "@screens/china-invoice-request";
import type { ChinaInvoiceListSearch } from "@entities/china";

// legacy pc/_Admin_/china/invoice_request.php → /china/invoice_request
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaInvoiceRequestRoute = () => {
  const search = Route.useSearch();
  return <ChinaInvoiceRequestScreen {...search} />;
};

export const Route = createFileRoute("/china/invoice_request")({
  validateSearch: (search: Record<string, unknown>): ChinaInvoiceListSearch => ({
    page: Number(search.page) || 1,
    search_year: str(search.search_year),
    search_settle_no: str(search.search_settle_no),
    search_name: str(search.search_name),
    search_email: str(search.search_email),
  }),
  component: ChinaInvoiceRequestRoute,
});
