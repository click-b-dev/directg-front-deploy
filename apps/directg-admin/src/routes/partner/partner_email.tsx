import { createFileRoute } from "@tanstack/react-router";
import { PartnerEmailScreen } from "@screens/partner-email";
import type { PartnerEmailSearch } from "@entities/partner";

// legacy pc/_Admin_/partner/partner_email.php → /partner/partner_email
const PartnerEmailRoute = () => {
  const search = Route.useSearch();
  return <PartnerEmailScreen {...search} />;
};

export const Route = createFileRoute("/partner/partner_email")({
  validateSearch: (search: Record<string, unknown>): PartnerEmailSearch => ({
    page: Number(search.page) || 1,
  }),
  component: PartnerEmailRoute,
});
