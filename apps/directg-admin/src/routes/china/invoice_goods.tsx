import { createFileRoute } from "@tanstack/react-router";
import { ChinaInvoiceGoodsScreen } from "@screens/china-invoice-goods";
import type { ChinaGoodsListSearch } from "@entities/china";

// legacy pc/_Admin_/china/invoice_goods.php → /china/invoice_goods
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaInvoiceGoodsRoute = () => {
  const search = Route.useSearch();
  return <ChinaInvoiceGoodsScreen {...search} />;
};

export const Route = createFileRoute("/china/invoice_goods")({
  validateSearch: (search: Record<string, unknown>): ChinaGoodsListSearch => ({
    page: Number(search.page) || 1,
    search_name: str(search.search_name),
    search_platform: str(search.search_platform),
  }),
  component: ChinaInvoiceGoodsRoute,
});
