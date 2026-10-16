import { createFileRoute } from "@tanstack/react-router";
import { ChinaInvoiceViewScreen } from "@screens/china-invoice-view";
import type { ChinaOrderDetailSearch } from "@entities/china";

// legacy pc/_Admin_/china/invoice_view.php → /china/invoice_view
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaInvoiceViewRoute = () => {
  const search = Route.useSearch();
  return <ChinaInvoiceViewScreen {...search} />;
};

export const Route = createFileRoute("/china/invoice_view")({
  validateSearch: (search: Record<string, unknown>): ChinaOrderDetailSearch => ({
    settle_no: str(search.settle_no),
  }),
  component: ChinaInvoiceViewRoute,
});
