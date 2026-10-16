import { createFileRoute } from "@tanstack/react-router";
import { ChinaInvoiceMemberScreen } from "@screens/china-invoice-member";
import type { ChinaMemberListSearch } from "@entities/china";

// legacy pc/_Admin_/china/invoice_member.php → /china/invoice_member
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaInvoiceMemberRoute = () => {
  const search = Route.useSearch();
  return <ChinaInvoiceMemberScreen {...search} />;
};

export const Route = createFileRoute("/china/invoice_member")({
  validateSearch: (search: Record<string, unknown>): ChinaMemberListSearch => ({
    page: Number(search.page) || 1,
    search_name: str(search.search_name),
    search_email: str(search.search_email),
  }),
  component: ChinaInvoiceMemberRoute,
});
