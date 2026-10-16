import { createFileRoute } from "@tanstack/react-router";
import { ChinaInvoiceModifyScreen } from "@screens/china-invoice-modify";
import type { ChinaOrderModifySearch } from "@entities/china";

// legacy pc/_Admin_/china/invoice_modify.php → /china/invoice_modify
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaInvoiceModifyRoute = () => {
  const search = Route.useSearch();
  return <ChinaInvoiceModifyScreen {...search} />;
};

export const Route = createFileRoute("/china/invoice_modify")({
  validateSearch: (search: Record<string, unknown>): ChinaOrderModifySearch => ({
    settle_no: str(search.settle_no),
  }),
  component: ChinaInvoiceModifyRoute,
});
