import { createFileRoute } from "@tanstack/react-router";
import { ChinaInvoiceListScreen } from "@screens/china-invoice-list";
import type { ChinaInvoiceListSearch } from "@entities/china";

// legacy pc/_Admin_/china/invoice_list.php → /china/invoice_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaInvoiceListRoute = () => {
  const search = Route.useSearch();
  return <ChinaInvoiceListScreen {...search} />;
};

export const Route = createFileRoute("/china/invoice_list")({
  validateSearch: (search: Record<string, unknown>): ChinaInvoiceListSearch => ({
    page: Number(search.page) || 1,
    search_year: str(search.search_year),
    search_settle_no: str(search.search_settle_no),
    search_name: str(search.search_name),
    search_email: str(search.search_email),
  }),
  component: ChinaInvoiceListRoute,
});
